package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.SelfHealingTestRequest;
import com.example.ai_chat_app.dto.SelfHealingTestResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SelfHealingTestService {

    private static final Logger log = LoggerFactory.getLogger(SelfHealingTestService.class);
    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ollama.base.url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model.name:llama3.2}")
    private String modelName;

    public SelfHealingTestResponse healBrokenTest(SelfHealingTestRequest request) {
        long startTime = System.currentTimeMillis();
        String errorLog = request.getErrorLog() != null ? request.getErrorLog().trim() : "";
        String brokenLocator = request.getBrokenLocator() != null ? request.getBrokenLocator().trim() : extractLocatorFromError(errorLog);
        String domSnippet = request.getDomSnippet() != null ? request.getDomSnippet().trim() : "";
        String framework = request.getTargetFramework() != null ? request.getTargetFramework() : "SELENIUM_JAVA";

        SelfHealingTestResponse response = null;

        // 1. Attempt LLM-Powered Analysis via Ollama (llama3.2)
        try {
            response = callLlmHealer(errorLog, brokenLocator, domSnippet, framework);
        } catch (Exception e) {
            log.warn("Ollama LLM healing unavailable or timed out: {}", e.getMessage());
        }

        // 2. Intelligent Deterministic Fallback if LLM output was null or incomplete
        if (response == null || response.getPrimaryHealedLocator() == null || response.getPrimaryHealedLocator().isBlank()) {
            response = executeDeterministicDomHealing(brokenLocator, errorLog, domSnippet, framework);
        }

        long latency = Math.max(1, System.currentTimeMillis() - startTime);
        response.setExecutionLatencyMs(latency);
        return response;
    }

    private SelfHealingTestResponse callLlmHealer(String errorLog, String brokenLocator, String domSnippet, String framework) {
        String prompt = String.format("""
                You are a Principal Test Automation Architect & Selenium/Playwright Expert.
                Analyze the following failing test error log and modified HTML DOM snippet, then heal the broken locator.
                
                FAILING ERROR LOG:
                %s
                
                BROKEN LOCATOR:
                %s
                
                MODIFIED HTML DOM CONTEXT:
                %s
                
                TARGET FRAMEWORK:
                %s
                
                Respond ONLY in strict, valid JSON format matching this schema without markdown fences:
                {
                  "primaryHealedLocator": "css or xpath locator",
                  "locatorType": "DATA_TESTID or CSS or XPATH or ROLE",
                  "alternativeLocators": ["alt1", "alt2"],
                  "confidenceScore": 0.95,
                  "rootCauseAnalysis": "Explain why the locator failed",
                  "explanation": "Explain why the healed locator is robust and resilient",
                  "healedCodeSnippet": "Code snippet in target framework",
                  "resilientBestPractices": "Advice on preventing flaky locators in CI/CD"
                }
                """, errorLog, brokenLocator, domSnippet, framework);

        Map<String, Object> body = Map.of(
                "model", modelName != null ? modelName : "llama3.2",
                "prompt", prompt,
                "stream", false,
                "format", "json"
        );

        String raw = webClient.post()
                .uri(ollamaBaseUrl + "/api/generate")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(4000))
                .block();

        if (raw != null) {
            try {
                JsonNode root = objectMapper.readTree(raw);
                if (root.has("response")) {
                    String jsonStr = root.get("response").asText();
                    return objectMapper.readValue(jsonStr, SelfHealingTestResponse.class);
                }
            } catch (Exception parseEx) {
                log.warn("Failed to parse JSON from Ollama response: {}", parseEx.getMessage());
            }
        }
        return null;
    }

    private SelfHealingTestResponse executeDeterministicDomHealing(String brokenLocator, String errorLog, String domSnippet, String framework) {
        SelfHealingTestResponse res = new SelfHealingTestResponse();

        // 1. Inspect DOM snippet for robust test attributes: data-testid, data-test, id, aria-label, role, text
        String healedLocator = null;
        String locatorType = "CSS";
        List<String> alternatives = new ArrayList<>();
        double confidence = 0.85;
        String cause = "The original locator broke due to DOM refactoring or dynamic class/ID mutations.";

        // Check for data-testid
        Matcher testIdMatcher = Pattern.compile("data-testid=[\"']([^\"']+)[\"']").matcher(domSnippet);
        if (testIdMatcher.find()) {
            String testId = testIdMatcher.group(1);
            healedLocator = "[data-testid='" + testId + "']";
            locatorType = "DATA_TESTID";
            confidence = 0.98;
            cause = "Original locator failed because developers removed legacy identifiers in favor of standardized 'data-testid=\"" + testId + "\"' test hooks.";
            alternatives.add("//*[@data-testid='" + testId + "']");
        }

        // Check for aria-label or role
        Matcher ariaMatcher = Pattern.compile("aria-label=[\"']([^\"']+)[\"']").matcher(domSnippet);
        if (ariaMatcher.find()) {
            String aria = ariaMatcher.group(1);
            if (healedLocator == null) {
                healedLocator = "[aria-label='" + aria + "']";
                locatorType = "ACCESSIBILITY";
                confidence = 0.94;
                cause = "Original selector broke due to component layout restructuring; accessible label 'aria-label=\"" + aria + "\"' is now present.";
            } else {
                alternatives.add("[aria-label='" + aria + "']");
                alternatives.add("//*[@aria-label='" + aria + "']");
            }
        }

        // Check for button text
        Matcher btnTextMatcher = Pattern.compile("<button[^>]*>([^<]+)</button>", Pattern.CASE_INSENSITIVE).matcher(domSnippet);
        if (btnTextMatcher.find()) {
            String text = btnTextMatcher.group(1).trim();
            if (!text.isBlank()) {
                String textXpath = "//button[contains(normalize-space(), '" + text + "')]";
                if (healedLocator == null) {
                    healedLocator = textXpath;
                    locatorType = "XPATH";
                    confidence = 0.91;
                    cause = "Button ID or CSS classes were renamed; healed by anchoring to visible semantic text content '" + text + "'.";
                } else {
                    alternatives.add(textXpath);
                }
            }
        }

        // Fallback generic locator if still null
        if (healedLocator == null) {
            healedLocator = brokenLocator.contains("//") ? "//button[1]" : "button:first-of-type";
            locatorType = "CSS";
            confidence = 0.75;
            cause = "Generic fallback selector generated based on nearest interactive element.";
        }

        // Generate framework-specific healed code snippet
        String codeSnippet = generateCodeSnippet(framework, healedLocator, locatorType);

        res.setPrimaryHealedLocator(healedLocator);
        res.setLocatorType(locatorType);
        res.setAlternativeLocators(alternatives);
        res.setConfidenceScore(confidence);
        res.setRootCauseAnalysis(cause);
        res.setExplanation("The healed locator binds to stable attributes (" + locatorType + ") immune to stylesheet refactoring and responsive layout shifts.");
        res.setHealedCodeSnippet(codeSnippet);
        res.setResilientBestPractices("1. Prefer explicit 'data-testid' over styling classes.\n2. Avoid brittle deep XPath chains like /html/body/div[2]/div/...\n3. Leverage Playwright getByRole/getByTestId or Page Object models with auto-retry waits.");

        return res;
    }

    private String generateCodeSnippet(String framework, String locator, String type) {
        return switch (framework.toUpperCase()) {
            case "PLAYWRIGHT_TS", "PLAYWRIGHT_JAVASCRIPT" -> {
                if ("DATA_TESTID".equals(type)) {
                    String id = locator.replaceAll("[\\[\\]'\"data-testid=]", "");
                    yield String.format("// Playwright Healed Locator\nawait page.getByTestId('%s').click();", id);
                } else {
                    yield String.format("// Playwright Healed Locator\nawait page.locator('%s').click();", locator);
                }
            }
            case "PLAYWRIGHT_JAVA" -> {
                if ("DATA_TESTID".equals(type)) {
                    String id = locator.replaceAll("[\\[\\]'\"data-testid=]", "");
                    yield String.format("// Playwright Java Healed Locator\npage.getByTestId(\"%s\").click();", id);
                } else {
                    yield String.format("// Playwright Java Healed Locator\npage.locator(\"%s\").click();", locator);
                }
            }
            case "CYPRESS" -> {
                if ("DATA_TESTID".equals(type)) {
                    String id = locator.replaceAll("[\\[\\]'\"data-testid=]", "");
                    yield String.format("// Cypress Healed Locator\ncy.get('[data-testid=\"%s\"]').click();", id);
                } else {
                    yield String.format("// Cypress Healed Locator\ncy.get('%s').click();", locator);
                }
            }
            default -> { // SELENIUM_JAVA
                if (locator.startsWith("//") || locator.startsWith("(")) {
                    yield String.format("""
                            // Selenium Java Healed Locator (Explicit Wait + Resilient XPath)
                            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
                            WebElement healedElement = wait.until(
                                ExpectedConditions.elementToBeClickable(By.xpath("%s"))
                            );
                            healedElement.click();
                            """, locator);
                } else {
                    yield String.format("""
                            // Selenium Java Healed Locator (Explicit Wait + Resilient CSS)
                            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
                            WebElement healedElement = wait.until(
                                ExpectedConditions.elementToBeClickable(By.cssSelector("%s"))
                            );
                            healedElement.click();
                            """, locator);
                }
            }
        };
    }

    private String extractLocatorFromError(String errorLog) {
        if (errorLog == null) return "#unknown-target";
        Matcher m = Pattern.compile("['\"]selector['\"]\\s*:\\s*['\"]([^'\"]+)['\"]").matcher(errorLog);
        if (m.find()) return m.group(1);

        Matcher m2 = Pattern.compile("Unable to locate element: \\{([^}]+)\\}").matcher(errorLog);
        if (m2.find()) return m2.group(1);

        return "#element-selector";
    }

    public List<Map<String, Object>> getPrebuiltSamples() {
        return List.of(
                Map.of(
                        "id", "sample-checkout-btn",
                        "title", "1. Checkout Button - Legacy ID Removed & Dynamic Tailwind Utility Classes Renamed",
                        "framework", "SELENIUM_JAVA",
                        "brokenLocator", "#checkout-btn-legacy",
                        "errorLog", "org.openqa.selenium.NoSuchElementException: Unable to locate element: {\"method\":\"css selector\",\"selector\":\"#checkout-btn-legacy\"}\nBuild info: version: '4.18.1', revision: 'b1d3319b48'\nSystem info: os.name: 'Windows 11', os.arch: 'amd64'\nSession ID: 7a82b9e4f",
                        "domSnippet", "<div class=\"order-summary-card p-6 bg-slate-900/60 rounded-3xl border border-white/10\">\n  <h3 class=\"text-lg font-bold text-white\">Cart Summary</h3>\n  <p class=\"text-sm text-slate-400\">Items: 2 (Total: $149.00)</p>\n  <button data-testid=\"checkout-submit-btn\" class=\"w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/30 active:scale-[0.98]\">\n    Complete Purchase ($149.00)\n  </button>\n</div>"
                ),
                Map.of(
                        "id", "sample-fragile-xpath",
                        "title", "2. Fragile Absolute XPath - Broken By Newly Injected Banner DOM Node",
                        "framework", "PLAYWRIGHT_TS",
                        "brokenLocator", "/html/body/div[1]/div[2]/main/div[3]/button[1]",
                        "errorLog", "locator.click: Target page, context or browser has been closed\nCall log:\n  - waiting for locator('/html/body/div[1]/div[2]/main/div[3]/button[1]')\n  - locator resolved to <button class=\"dismiss-promo\">Dismiss</button> instead of intended Coupon CTA",
                        "domSnippet", "<header class=\"site-header\">\n  <div class=\"promo-banner bg-amber-500/20 text-amber-300 p-2\">Flash Sale: 20% off with promo code SPATIAL20</div>\n</header>\n<main class=\"container mx-auto p-4\">\n  <div class=\"coupon-wrapper flex items-center gap-2\">\n    <input type=\"text\" placeholder=\"Enter Promo Code\" class=\"glass-input\" />\n    <button aria-label=\"Apply Promotional Discount Code\" data-testid=\"apply-coupon-btn\" class=\"btn-coupon px-4 py-2 bg-emerald-600 text-white rounded-xl\">\n      Apply Discount\n    </button>\n  </div>\n</main>"
                ),
                Map.of(
                        "id", "sample-combobox-modal",
                        "title", "3. Form Dropdown - Standard Select Replaced With Accessible ARIA Combobox",
                        "framework", "SELENIUM_JAVA",
                        "brokenLocator", "select[name='department_id']",
                        "errorLog", "org.openqa.selenium.NoSuchElementException: Unable to locate element: {\"method\":\"css selector\",\"selector\":\"select[name='department_id']\"}\nElement not found in DOM after React 19 component refactoring.",
                        "domSnippet", "<div class=\"form-group space-y-2\">\n  <label class=\"text-xs text-slate-300\">Select Department</label>\n  <div role=\"combobox\" aria-expanded=\"false\" aria-haspopup=\"listbox\" data-testid=\"dept-select-combobox\" class=\"relative w-full\">\n    <input type=\"text\" role=\"searchbox\" aria-label=\"Search Engineering Department\" placeholder=\"Search departments...\" class=\"glass-input w-full pl-3 py-2\" />\n  </div>\n</div>"
                ),
                Map.of(
                        "id", "sample-user-avatar",
                        "title", "4. User Avatar Menu - Stale Element From Dynamic Re-render",
                        "framework", "CYPRESS",
                        "brokenLocator", ".user-avatar-menu",
                        "errorLog", "CypressError: `cy.click()` failed because the element has been detached from the DOM.\n<div class=\"user-avatar-menu\">...</div>\nCommonly happens when React components re-render asynchronously.",
                        "domSnippet", "<nav class=\"top-nav flex items-center justify-between p-3\">\n  <div class=\"brand-title\">Spatial AI Collaboration</div>\n  <div class=\"user-actions flex items-center gap-3\">\n    <button data-testid=\"user-profile-menu-trigger\" aria-label=\"Open User Profile Menu\" aria-haspopup=\"true\" class=\"p-1.5 rounded-full hover:bg-white/10 transition-colors\">\n      <img src=\"/avatars/alex.png\" alt=\"Alex Rivera Profile\" class=\"w-8 h-8 rounded-full border border-indigo-400\" />\n    </button>\n  </div>\n</nav>"
                )
        );
    }
}
