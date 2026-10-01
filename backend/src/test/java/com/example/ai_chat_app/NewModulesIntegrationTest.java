package com.example.ai_chat_app;

import com.example.ai_chat_app.dto.*;
import com.example.ai_chat_app.model.Conversation;
import com.example.ai_chat_app.model.SwarmExecution;
import com.example.ai_chat_app.model.Task;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.ConversationRepository;
import com.example.ai_chat_app.repository.EvaluationReportRepository;
import com.example.ai_chat_app.repository.SwarmExecutionRepository;
import com.example.ai_chat_app.repository.TaskRepository;
import com.example.ai_chat_app.repository.UserRepository;
import com.example.ai_chat_app.service.AiEvaluationService;
import com.example.ai_chat_app.service.BugTriageSwarmService;
import com.example.ai_chat_app.service.SelfHealingTestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class NewModulesIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private AiEvaluationService aiEvaluationService;

    @Autowired
    private SelfHealingTestService selfHealingTestService;

    @Autowired
    private BugTriageSwarmService bugTriageSwarmService;

    @Autowired
    private EvaluationReportRepository evaluationReportRepository;

    @Autowired
    private SwarmExecutionRepository swarmExecutionRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        this.objectMapper.findAndRegisterModules();
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    // =========================================================================
    // 1. AI Evaluation & Reliability Harness Tests
    // =========================================================================
    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testAiEvaluationBenchmarkSuiteExecution() {
        EvaluationRunRequest request = new EvaluationRunRequest("ALL", "llama3.2");
        EvaluationBatchResultDto batchResult = aiEvaluationService.executeBenchmarkSuite(request);

        assertNotNull(batchResult, "Batch result must not be null");
        assertNotNull(batchResult.getBatchId(), "Batch ID must be generated");
        assertTrue(batchResult.getTotalCases() >= 4, "Must execute at least 4 test cases");
        assertTrue(batchResult.getAverageLatencyMs() >= 0, "Latency must be tracked");
        assertTrue(batchResult.getAverageGroundingScore() >= 0.0, "Grounding score must be calculated");
        assertTrue(batchResult.getTotalTokens() > 0, "Token consumption count must be tracked");
        assertFalse(batchResult.getReports().isEmpty(), "Reports list must be populated");

        // Verify database persistence
        long count = evaluationReportRepository.count();
        assertTrue(count >= batchResult.getTotalCases(), "Evaluation reports must be stored in database");
    }

    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testEvaluationSummaryEndpoint() throws Exception {
        mockMvc.perform(get("/api/evaluation/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRuns").exists())
                .andExpect(jsonPath("$.passRate").exists())
                .andExpect(jsonPath("$.averageLatencyMs").exists())
                .andExpect(jsonPath("$.averageGroundingScore").exists())
                .andExpect(jsonPath("$.totalTokensConsumed").exists());
    }

    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testEvaluationRunEndpoint() throws Exception {
        EvaluationRunRequest request = new EvaluationRunRequest("RAG", "llama3.2");
        mockMvc.perform(post("/api/evaluation/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.batchId").exists())
                .andExpect(jsonPath("$.suite").value("RAG"))
                .andExpect(jsonPath("$.totalCases").value(2));
    }

    // =========================================================================
    // 2. AI-Powered Self-Healing Test Assistant Tests
    // =========================================================================
    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testSelfHealingServiceWithModifiedDom() {
        SelfHealingTestRequest req = new SelfHealingTestRequest();
        req.setBrokenLocator("#checkout-btn-legacy");
        req.setErrorLog("NoSuchElementException: Unable to locate element: {\"method\":\"css selector\",\"selector\":\"#checkout-btn-legacy\"}");
        req.setDomSnippet("<button data-testid=\"checkout-submit-btn\" class=\"bg-indigo-600 text-white font-bold\">Complete Order</button>");
        req.setTargetFramework("SELENIUM_JAVA");

        SelfHealingTestResponse res = selfHealingTestService.healBrokenTest(req);

        assertNotNull(res, "Self-healing response must not be null");
        assertNotNull(res.getPrimaryHealedLocator(), "Primary healed locator must be resolved");
        assertTrue(res.getPrimaryHealedLocator().contains("checkout-submit-btn"),
                "Healed locator should locate data-testid checkout-submit-btn");
        assertTrue(res.getConfidenceScore() >= 0.80, "Confidence score must be >= 80%");
        assertNotNull(res.getHealedCodeSnippet(), "Synthesized code snippet must be generated");
        assertTrue(res.getHealedCodeSnippet().contains("By."), "Selenium snippet must use By selector");
        assertNotNull(res.getRootCauseAnalysis(), "Root cause analysis must be explained");
    }

    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testSelfHealingPlaywrightFrameworkTargeting() {
        SelfHealingTestRequest req = new SelfHealingTestRequest();
        req.setBrokenLocator(".cart-btn-old");
        req.setErrorLog("locator.click: Target closed waiting for .cart-btn-old");
        req.setDomSnippet("<button aria-label=\"Add to Shopping Cart\" class=\"btn-cart\">Add to Cart</button>");
        req.setTargetFramework("PLAYWRIGHT_TS");

        SelfHealingTestResponse res = selfHealingTestService.healBrokenTest(req);

        assertNotNull(res.getPrimaryHealedLocator());
        assertNotNull(res.getHealedCodeSnippet());
        assertTrue(res.getHealedCodeSnippet().contains("page."), "Snippet must use Playwright page API");
    }

    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testSelfHealingSamplesEndpoint() throws Exception {
        mockMvc.perform(get("/api/qa/self-heal/samples"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(4));
    }

    // =========================================================================
    // 3. Autonomous Multi-Agent Swarm Workflows Tests
    // =========================================================================
    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testAutonomousSwarmTriageWorkflow() {
        // Find or create test task
        Task task = taskRepository.findAll().stream().findFirst().orElseGet(() -> {
            Task t = new Task();
            t.setTaskKey("NEX-TEST-SWARM");
            t.setTitle("Payment Gateway Timeout During High Concurrency");
            t.setDescription("401 Unauthorized token expired exception during checkout");
            t.setPriority("HIGH");
            t.setStatus("TODO");
            return taskRepository.save(t);
        });

        task.setPriority("CRITICAL");
        task.setTitle("Authentication Bearer Token Refresh Failure in WebSocket Handshake");

        // Execute Swarm Triage
        SwarmExecution execution = bugTriageSwarmService.executeSwarmTriage(task, true);

        assertNotNull(execution, "Swarm execution must not be null");
        assertEquals("COMPLETED", execution.getStatus(), "Status should be COMPLETED");
        assertNotNull(execution.getAssignedEngineer(), "Project Manager agent must assign an engineer");
        assertNotNull(execution.getPmRationale(), "PM rationale must be recorded");
        assertNotNull(execution.getSuspectedFile(), "Code Inspector agent must identify suspected file");
        assertTrue(execution.getSuspectedFile().toLowerCase().contains("security") ||
                   execution.getSuspectedFile().toLowerCase().contains("jwt") ||
                   execution.getSuspectedFile().toLowerCase().contains("task"),
                "Code inspector must correlate auth keyword with security files");
        assertNotNull(execution.getRootCauseAnalysis(), "Root cause hypothesis must be generated");
        assertNotNull(execution.getDispatchedChannel(), "Support agent must dispatch notification");

        // Verify task updated in database
        Task updatedTask = taskRepository.findById(task.getId()).orElseThrow();
        assertNotNull(updatedTask.getAssignee(), "Task must have an assignee set by PM agent");
        assertTrue(updatedTask.getStoryPoints() > 0, "Story points must be calibrated by PM agent");
    }

    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testSwarmExecutionsEndpoint() throws Exception {
        mockMvc.perform(get("/api/swarm/executions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "vansh", roles = {"ADMIN"})
    public void testTaskCreationTriggersSwarmWorkflow() throws Exception {
        TaskDto newTask = new TaskDto();
        newTask.setTitle("[BUG] Critical Database Connection Pool Exhaustion");
        newTask.setDescription("Active connections maxed out under load");
        newTask.setPriority("CRITICAL");
        newTask.setStatus("TODO");
        newTask.setStoryPoints(0);

        MvcResult result = mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newTask)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.key").exists())
                .andExpect(jsonPath("$.title").value("[BUG] Critical Database Connection Pool Exhaustion"))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertTrue(body.contains("NEX-"), "Response must contain task key prefix NEX-");
    }
}
