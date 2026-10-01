package com.example.ai_chat_app.dto;

public class SelfHealingTestRequest {
    private String errorLog;
    private String brokenLocator;
    private String domSnippet;
    private String targetFramework = "SELENIUM_JAVA"; // SELENIUM_JAVA, PLAYWRIGHT_TS, PLAYWRIGHT_JAVA, CYPRESS
    private String testCodeSnippet;

    public SelfHealingTestRequest() {}

    public String getErrorLog() { return errorLog; }
    public void setErrorLog(String errorLog) { this.errorLog = errorLog; }

    public String getBrokenLocator() { return brokenLocator; }
    public void setBrokenLocator(String brokenLocator) { this.brokenLocator = brokenLocator; }

    public String getDomSnippet() { return domSnippet; }
    public void setDomSnippet(String domSnippet) { this.domSnippet = domSnippet; }

    public String getTargetFramework() { return targetFramework != null ? targetFramework : "SELENIUM_JAVA"; }
    public void setTargetFramework(String targetFramework) { this.targetFramework = targetFramework; }

    public String getTestCodeSnippet() { return testCodeSnippet; }
    public void setTestCodeSnippet(String testCodeSnippet) { this.testCodeSnippet = testCodeSnippet; }
}
