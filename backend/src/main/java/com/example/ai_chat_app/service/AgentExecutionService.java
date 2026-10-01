package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.AgentChatRequest;
import com.example.ai_chat_app.dto.AgentChatResponse;
import com.example.ai_chat_app.dto.ToolExecutionRecord;
import com.example.ai_chat_app.model.*;
import com.example.ai_chat_app.repository.ChannelRepository;
import com.example.ai_chat_app.repository.SlackMessageRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

@Service
public class AgentExecutionService {

    private static final Logger log = LoggerFactory.getLogger(AgentExecutionService.class);
    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private TicketService ticketService;

    @Autowired
    private ProjectManagementService projectManagementService;

    @Autowired
    private SupportKnowledgeService supportKnowledgeService;

    @Autowired
    private SlackMessageRepository slackMessageRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private AuthService authService;

    @Value("${ollama.api.url:http://localhost:11434/api/chat}")
    private String ollamaChatUrl;

    @Value("${ollama.model.name:llama3.2}")
    private String defaultModel;

    private static final int MAX_AGENT_LOOPS = 4;

    public AgentChatResponse processAgentChat(AgentChatRequest request, User currentUser) {
        String effectiveModel = (request.getModel() != null && !request.getModel().isBlank())
                ? request.getModel()
                : defaultModel;

        Long channelId = request.getChannelId() != null ? request.getChannelId() : 1L;
        Channel channel = channelRepository.findById(channelId).orElse(null);

        // Determine active assistant persona
        String assistant = request.getAssistant();
        if ((assistant == null || assistant.isBlank()) && channel != null && channel.getTargetAssistant() != null) {
            assistant = channel.getTargetAssistant();
        }
        if (assistant == null || assistant.isBlank()) {
            assistant = "@helpdesk";
        }

        // Fallback user if unauthenticated
        User effectiveUser = (currentUser != null) ? currentUser : authService.getCurrentAuthenticatedUser();
        if (effectiveUser == null) {
            effectiveUser = new User("guest@company.com", "", "Guest User", "ROLE_EMPLOYEE", "Operations");
        }

        // 1. Persist User Message to Slack channel
        SlackMessage userSlackMsg = new SlackMessage(
                channelId,
                effectiveUser,
                effectiveUser.getFullName(),
                "user",
                request.getPrompt(),
                null
        );
        slackMessageRepository.save(userSlackMsg);

        // 2. Build Tools according to Assistant role
        List<Map<String, Object>> tools = getToolsForAssistant(assistant);

        // 3. Assemble Conversation History
        List<Map<String, Object>> messages = new ArrayList<>();

        // Inject System Prompt with verified User Identity and Guardrails
        String systemPrompt = buildSystemPrompt(assistant, effectiveUser);
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Add recent channel chat history (last 6 messages)
        List<SlackMessage> history = slackMessageRepository.findTop10ByChannelIdOrderByCreatedAtDesc(channelId);
        Collections.reverse(history);
        for (SlackMessage sm : history) {
            if ("user".equalsIgnoreCase(sm.getSenderRole()) || "assistant".equalsIgnoreCase(sm.getSenderRole())) {
                messages.add(Map.of("role", sm.getSenderRole().toLowerCase(), "content", sm.getContent()));
            }
        }

        // Ensure current prompt is included at the end
        if (history.isEmpty() || !history.get(history.size() - 1).getContent().equals(request.getPrompt())) {
            messages.add(Map.of("role", "user", "content", request.getPrompt()));
        }

        // 4. Run the Agent Execution Loop
        List<ToolExecutionRecord> toolExecutions = new ArrayList<>();
        boolean ticketsUpdated = false;
        String finalAnswer = "";

        int loopCount = 0;
        while (loopCount < MAX_AGENT_LOOPS) {
            loopCount++;
            log.info("Agent Loop Cycle #{} for user {}", loopCount, effectiveUser.getEmail());

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("model", effectiveModel);
            payload.put("stream", false);
            payload.put("messages", messages);
            payload.put("tools", tools);

            Map<String, Object> responseMap = callOllama(payload);
            if (responseMap == null || !responseMap.containsKey("message")) {
                finalAnswer = generateSmartFallbackReply(request.getPrompt(), assistant, effectiveUser);
                break;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> assistantMessage = (Map<String, Object>) responseMap.get("message");
            Object toolCallsObj = assistantMessage.get("tool_calls");

            // If model produced tool calls
            if (toolCallsObj instanceof List<?> rawCalls && !rawCalls.isEmpty()) {
                // Append assistant message with tool calls to conversation
                messages.add(assistantMessage);

                for (Object rawCall : rawCalls) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> toolCall = (Map<String, Object>) rawCall;
                    @SuppressWarnings("unchecked")
                    Map<String, Object> function = (Map<String, Object>) toolCall.get("function");

                    String toolName = (String) function.get("name");
                    Map<String, Object> arguments = extractArguments(function.get("arguments"));

                    log.info("Agent invoked tool: {} with args: {}", toolName, arguments);

                    // Execute tool with RBAC check
                    ToolResult result = executeToolWithRbac(toolName, arguments, effectiveUser);

                    if (result.isStateMutated()) {
                        ticketsUpdated = true;
                    }

                    // Record tool execution telemetry
                    toolExecutions.add(new ToolExecutionRecord(
                            toolName,
                            arguments,
                            result.getStatus(),
                            result.getSummary()
                    ));

                    // Append tool output message to conversation
                    Map<String, Object> toolMessage = new LinkedHashMap<>();
                    toolMessage.put("role", "tool");
                    toolMessage.put("content", result.getOutputJson());
                    messages.add(toolMessage);
                }

                // Continue loop so Ollama can read the tool output and reflect
                continue;
            }

            // Otherwise, model returned a final text response
            String content = (String) assistantMessage.get("content");
            finalAnswer = (content != null) ? content.trim() : "";
            break;
        }

        if (finalAnswer.isBlank() && !toolExecutions.isEmpty()) {
            finalAnswer = "Completed requested actions: " + toolExecutions.get(toolExecutions.size() - 1).getSummary();
        }

        // 5. Persist Assistant Message in Slack channel
        String toolMetaJson = null;
        try {
            if (!toolExecutions.isEmpty()) {
                toolMetaJson = objectMapper.writeValueAsString(toolExecutions);
            }
        } catch (Exception ignored) {}

        SlackMessage assistantSlackMsg = new SlackMessage(
                channelId,
                null,
                getAssistantDisplayName(assistant),
                "assistant",
                finalAnswer,
                toolMetaJson
        );
        slackMessageRepository.save(assistantSlackMsg);

        return new AgentChatResponse(
                finalAnswer,
                toolExecutions,
                ticketsUpdated,
                assistant,
                channelId
        );
    }

    private ToolResult executeToolWithRbac(String toolName, Map<String, Object> args, User currentUser) {
        String role = currentUser.getRole();
        if (role == null) role = "ROLE_EMPLOYEE";

        try {
            switch (toolName) {
                case "create_ticket" -> {
                    // Allowed for all roles
                    String title = (String) args.getOrDefault("title", "New Issue");
                    String desc = (String) args.getOrDefault("description", title);
                    String category = (String) args.getOrDefault("category", "TASK");
                    String priority = (String) args.getOrDefault("priority", "MEDIUM");
                    String projectKey = (String) args.getOrDefault("projectKey", "INFRA");

                    // Override reporter strictly with currentUser (prevent impersonation)
                    Ticket ticket = ticketService.createTicket(title, desc, category, priority, projectKey, currentUser);

                    Map<String, Object> data = Map.of(
                            "status", "SUCCESS",
                            "ticketKey", ticket.getTicketKey(),
                            "title", ticket.getTitle(),
                            "priority", ticket.getPriority(),
                            "reporter", currentUser.getFullName(),
                            "message", "Ticket " + ticket.getTicketKey() + " was successfully created."
                    );
                    return new ToolResult("SUCCESS", "Created ticket " + ticket.getTicketKey() + " (" + ticket.getTitle() + ")", objectMapper.writeValueAsString(data), true);
                }

                case "check_ticket_status" -> {
                    // Allowed for all roles
                    String ticketKey = (String) args.get("ticketKey");
                    if (ticketKey == null || ticketKey.isBlank()) {
                        return new ToolResult("ERROR", "Ticket key is required", "{\"error\":\"Missing ticketKey\"}", false);
                    }
                    Ticket ticket = ticketService.getTicketDetails(ticketKey);
                    Map<String, Object> data = Map.of(
                            "ticketKey", ticket.getTicketKey(),
                            "title", ticket.getTitle(),
                            "status", ticket.getStatus(),
                            "priority", ticket.getPriority(),
                            "category", ticket.getCategory(),
                            "assignee", ticket.getAssignee() != null ? ticket.getAssignee().getFullName() : "Unassigned",
                            "reporter", ticket.getReporter() != null ? ticket.getReporter().getFullName() : "Unknown"
                    );
                    return new ToolResult("SUCCESS", "Fetched status for " + ticket.getTicketKey() + ": " + ticket.getStatus(), objectMapper.writeValueAsString(data), false);
                }

                case "update_ticket_status" -> {
                    // RBAC Guardrail: Requires ROLE_IT_SUPPORT, ROLE_PROJECT_MANAGER, or ROLE_ADMIN
                    if (!role.contains("IT_SUPPORT") && !role.contains("PROJECT_MANAGER") && !role.contains("ADMIN")) {
                        String msg = "Permission denied: User " + currentUser.getFullName() + " (" + role + ") lacks IT Support authority to change ticket status.";
                        return new ToolResult("PERMISSION_DENIED", msg, "{\"status\":\"ERROR\",\"error\":\"PERMISSION_DENIED\",\"message\":\"" + msg + "\"}", false);
                    }
                    String ticketKey = (String) args.get("ticketKey");
                    String newStatus = (String) args.get("newStatus");
                    Ticket ticket = ticketService.updateStatus(ticketKey, newStatus, currentUser);

                    Map<String, Object> data = Map.of(
                            "status", "SUCCESS",
                            "ticketKey", ticket.getTicketKey(),
                            "newStatus", ticket.getStatus(),
                            "message", "Ticket " + ticket.getTicketKey() + " transitioned to " + ticket.getStatus()
                    );
                    return new ToolResult("SUCCESS", "Updated " + ticket.getTicketKey() + " status to " + ticket.getStatus(), objectMapper.writeValueAsString(data), true);
                }

                case "assign_task" -> {
                    // RBAC Guardrail: Requires ROLE_PROJECT_MANAGER or ROLE_ADMIN
                    if (!role.contains("PROJECT_MANAGER") && !role.contains("ADMIN")) {
                        String msg = "Permission denied: User " + currentUser.getFullName() + " (" + role + ") lacks Project Manager authority to reassign tasks.";
                        return new ToolResult("PERMISSION_DENIED", msg, "{\"status\":\"ERROR\",\"error\":\"PERMISSION_DENIED\",\"message\":\"" + msg + "\"}", false);
                    }
                    String ticketKey = (String) args.get("ticketKey");
                    String assignee = (String) args.get("assignee");
                    Ticket ticket = ticketService.assignTicket(ticketKey, assignee, currentUser);

                    Map<String, Object> data = Map.of(
                            "status", "SUCCESS",
                            "ticketKey", ticket.getTicketKey(),
                            "assignee", ticket.getAssignee() != null ? ticket.getAssignee().getFullName() : "Unassigned",
                            "message", "Ticket " + ticket.getTicketKey() + " assigned to " + (ticket.getAssignee() != null ? ticket.getAssignee().getFullName() : "Unassigned")
                    );
                    return new ToolResult("SUCCESS", "Assigned " + ticket.getTicketKey() + " to " + (ticket.getAssignee() != null ? ticket.getAssignee().getFullName() : "none"), objectMapper.writeValueAsString(data), true);
                }

                case "reschedule_or_reprioritize" -> {
                    // RBAC Guardrail: Requires ROLE_PROJECT_MANAGER or ROLE_ADMIN
                    if (!role.contains("PROJECT_MANAGER") && !role.contains("ADMIN")) {
                        String msg = "Permission denied: User " + currentUser.getFullName() + " (" + role + ") lacks Project Manager authority to alter priorities.";
                        return new ToolResult("PERMISSION_DENIED", msg, "{\"status\":\"ERROR\",\"error\":\"PERMISSION_DENIED\",\"message\":\"" + msg + "\"}", false);
                    }
                    String ticketKey = (String) args.get("ticketKey");
                    String priority = (String) args.get("priority");
                    Ticket ticket = projectManagementService.rescheduleOrReprioritize(ticketKey, priority, currentUser);

                    Map<String, Object> data = Map.of(
                            "status", "SUCCESS",
                            "ticketKey", ticket.getTicketKey(),
                            "priority", ticket.getPriority(),
                            "message", "Priority for " + ticket.getTicketKey() + " set to " + ticket.getPriority()
                    );
                    return new ToolResult("SUCCESS", "Reprioritized " + ticket.getTicketKey() + " to " + ticket.getPriority(), objectMapper.writeValueAsString(data), true);
                }

                case "get_project_summary" -> {
                    // Allowed for all roles
                    String projectKey = (String) args.get("projectKey");
                    Map<String, Object> summary = projectManagementService.getProjectSummary(projectKey);
                    return new ToolResult("SUCCESS", "Fetched project metrics for " + (projectKey != null ? projectKey : "ALL"), objectMapper.writeValueAsString(summary), false);
                }

                case "search_internal_docs" -> {
                    // Allowed for all roles
                    String query = (String) args.get("query");
                    Map<String, Object> results = supportKnowledgeService.searchKnowledgeBase(query);
                    return new ToolResult("SUCCESS", "Searched knowledge base for '" + query + "'", objectMapper.writeValueAsString(results), false);
                }

                case "escalate_to_human" -> {
                    // Allowed for all roles
                    String issue = (String) args.getOrDefault("issue", "Unspecified issue");
                    String reason = (String) args.getOrDefault("reason", "User requested escalation");
                    Ticket escalated = supportKnowledgeService.escalateToHuman(issue, reason, currentUser);

                    Map<String, Object> data = Map.of(
                            "status", "SUCCESS",
                            "ticketKey", escalated.getTicketKey(),
                            "priority", escalated.getPriority(),
                            "message", "Issue escalated to engineering on-call as " + escalated.getTicketKey()
                    );
                    return new ToolResult("SUCCESS", "Escalated to human engineer: " + escalated.getTicketKey(), objectMapper.writeValueAsString(data), true);
                }

                default -> {
                    return new ToolResult("ERROR", "Unknown tool: " + toolName, "{\"error\":\"Unknown tool " + toolName + "\"}", false);
                }
            }
        } catch (NoSuchElementException e) {
            return new ToolResult("ERROR", e.getMessage(), "{\"status\":\"NOT_FOUND\",\"error\":\"" + e.getMessage() + "\"}", false);
        } catch (Exception e) {
            log.error("Error executing tool {}", toolName, e);
            return new ToolResult("ERROR", e.getMessage(), "{\"status\":\"ERROR\",\"error\":\"" + e.getMessage() + "\"}", false);
        }
    }

    private String buildSystemPrompt(String assistant, User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an autonomous AI Agent in a modern Slack and Jira enterprise workspace.\n");
        sb.append("Active User: ").append(user.getFullName())
                .append(" | Email: ").append(user.getEmail())
                .append(" | Role: ").append(user.getRole())
                .append(" | ID: ").append(user.getId())
                .append(" | Department: ").append(user.getDepartment() != null ? user.getDepartment() : "General")
                .append("\n\n");

        if ("@pm".equalsIgnoreCase(assistant)) {
            sb.append("Your Role: @pm (Project Manager Assistant).\n");
            sb.append("Responsibilities: Manage sprint workloads, project metrics, task assignment, and ticket priorities.\n");
            sb.append("Guidelines: When users ask about project status or backlog, call get_project_summary. When asked to assign tasks or adjust priorities, call assign_task or reschedule_or_reprioritize.\n");
        } else if ("@support".equalsIgnoreCase(assistant)) {
            sb.append("Your Role: @support (Support & Knowledge Assistant).\n");
            sb.append("Responsibilities: Help team members with internal documentation, policies, troubleshooting, and escalating urgent blockers to human on-call.\n");
            sb.append("Guidelines: When users ask about guidelines or policies, call search_internal_docs. If they cannot resolve an urgent issue, call escalate_to_human.\n");
        } else {
            sb.append("Your Role: @helpdesk (IT Helpdesk & Ticketing Assistant).\n");
            sb.append("Responsibilities: Help employees create IT tickets, inspect ticket status, and update ticket states.\n");
            sb.append("Guidelines: When users report issues, bugs, or hardware needs, call create_ticket. When they ask for status, call check_ticket_status.\n");
        }

        sb.append("\nOperational Rules:\n");
        sb.append("1. ALWAYS execute tools when the user's request requires action or accurate system data.\n");
        sb.append("2. When a tool returns a result, explain it clearly to the user in friendly Markdown.\n");
        sb.append("3. If a tool returns a PERMISSION_DENIED error, politely explain the authorization restriction based on the user's role.\n");
        sb.append("4. Never make up fictional ticket numbers; rely strictly on tool outputs.\n");

        return sb.toString();
    }

    private List<Map<String, Object>> getToolsForAssistant(String assistant) {
        List<Map<String, Object>> allTools = getAllTools();
        if ("@pm".equalsIgnoreCase(assistant)) {
            return filterTools(allTools, Set.of("get_project_summary", "assign_task", "reschedule_or_reprioritize", "create_ticket", "check_ticket_status"));
        } else if ("@support".equalsIgnoreCase(assistant)) {
            return filterTools(allTools, Set.of("search_internal_docs", "escalate_to_human", "create_ticket", "check_ticket_status"));
        } else {
            // @helpdesk or default
            return filterTools(allTools, Set.of("create_ticket", "check_ticket_status", "update_ticket_status", "search_internal_docs", "get_project_summary"));
        }
    }

    private List<Map<String, Object>> filterTools(List<Map<String, Object>> tools, Set<String> names) {
        return tools.stream()
                .filter(t -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> fn = (Map<String, Object>) t.get("function");
                    return names.contains((String) fn.get("name"));
                })
                .toList();
    }

    private List<Map<String, Object>> getAllTools() {
        List<Map<String, Object>> tools = new ArrayList<>();

        // 1. create_ticket
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "create_ticket",
                        "description", "Creates an actionable Jira ticket for bugs, IT hardware, access, or general tasks.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "title", Map.of("type", "string", "description", "Short title of the ticket"),
                                        "description", Map.of("type", "string", "description", "Detailed description of the issue"),
                                        "category", Map.of("type", "string", "description", "IT_HARDWARE, ACCESS, BUG, or TASK"),
                                        "priority", Map.of("type", "string", "description", "LOW, MEDIUM, HIGH, or CRITICAL"),
                                        "projectKey", Map.of("type", "string", "description", "Project key such as INFRA or DEV (defaults to INFRA)")
                                ),
                                "required", List.of("title", "description", "category", "priority")
                        )
                )
        ));

        // 2. check_ticket_status
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "check_ticket_status",
                        "description", "Retrieves current status, assignee, priority, and details for a ticket key (e.g. INFRA-101).",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "ticketKey", Map.of("type", "string", "description", "The ticket key, e.g. INFRA-101 or DEV-201")
                                ),
                                "required", List.of("ticketKey")
                        )
                )
        ));

        // 3. update_ticket_status
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "update_ticket_status",
                        "description", "Transitions ticket status to OPEN, IN_PROGRESS, RESOLVED, or CLOSED.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "ticketKey", Map.of("type", "string", "description", "The ticket key, e.g. INFRA-101"),
                                        "newStatus", Map.of("type", "string", "description", "OPEN, IN_PROGRESS, RESOLVED, or CLOSED")
                                ),
                                "required", List.of("ticketKey", "newStatus")
                        )
                )
        ));

        // 4. assign_task
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "assign_task",
                        "description", "Assigns an existing ticket to a team member by their name or email address.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "ticketKey", Map.of("type", "string", "description", "The ticket key, e.g. INFRA-101"),
                                        "assignee", Map.of("type", "string", "description", "Full name or email of the team member")
                                ),
                                "required", List.of("ticketKey", "assignee")
                        )
                )
        ));

        // 5. reschedule_or_reprioritize
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "reschedule_or_reprioritize",
                        "description", "Changes the priority of a ticket (LOW, MEDIUM, HIGH, CRITICAL).",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "ticketKey", Map.of("type", "string", "description", "The ticket key, e.g. INFRA-101"),
                                        "priority", Map.of("type", "string", "description", "New priority: LOW, MEDIUM, HIGH, or CRITICAL")
                                ),
                                "required", List.of("ticketKey", "priority")
                        )
                )
        ));

        // 6. get_project_summary
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "get_project_summary",
                        "description", "Fetches sprint metrics, open vs resolved counts, and high priority blockers for a project.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "projectKey", Map.of("type", "string", "description", "Project key such as INFRA or DEV (or blank for all)")
                                )
                        )
                )
        ));

        // 7. search_internal_docs
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "search_internal_docs",
                        "description", "Performs semantic vector search across uploaded company documents, policies, and guidelines.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "query", Map.of("type", "string", "description", "The search topic or question")
                                ),
                                "required", List.of("query")
                        )
                )
        ));

        // 8. escalate_to_human
        tools.add(Map.of(
                "type", "function",
                "function", Map.of(
                        "name", "escalate_to_human",
                        "description", "Escalates an unresolved issue to an on-call human engineer with CRITICAL priority.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "issue", Map.of("type", "string", "description", "Issue description or ticket key"),
                                        "reason", Map.of("type", "string", "description", "Why escalation is needed")
                                ),
                                "required", List.of("issue", "reason")
                        )
                )
        ));

        return tools;
    }

    private Map<String, Object> callOllama(Map<String, Object> payload) {
        try {
            return webClient.post()
                    .uri(ollamaChatUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            log.warn("Ollama chat call timed out or failed: {}", e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractArguments(Object argsObj) {
        if (argsObj instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        if (argsObj instanceof String str && !str.isBlank()) {
            try {
                return objectMapper.readValue(str, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse string arguments as JSON: {}", str);
            }
        }
        return new HashMap<>();
    }

    private String getAssistantDisplayName(String assistant) {
        if ("@pm".equalsIgnoreCase(assistant)) return "PM Agent (@pm)";
        if ("@support".equalsIgnoreCase(assistant)) return "Support Agent (@support)";
        return "IT Helpdesk Agent (@helpdesk)";
    }

    private String generateSmartFallbackReply(String prompt, String assistant, User user) {
        String pLower = prompt != null ? prompt.toLowerCase() : "";
        String userName = (user != null && user.getFullName() != null) ? user.getFullName() : "Operator";

        if (pLower.contains("ticket") || pLower.contains("issue") || pLower.contains("bug")) {
            List<Ticket> tickets = ticketService.listTickets(null, null);
            long openCount = tickets.stream().filter(t -> !"DONE".equalsIgnoreCase(t.getStatus())).count();
            return String.format("Hello %s, I checked our issue tracker. There are currently %d active tickets across the workspace. You can inspect or transition them on the Task Board.", userName, openCount);
        }
        if (pLower.contains("project") || pLower.contains("sprint") || pLower.contains("roadmap")) {
            return String.format("Hello %s, active enterprise initiatives include 'Spatial UX Overhaul', 'RAG Knowledge Pipeline', and 'RBAC Hardening'. All sprint deliverables are currently tracking on schedule.", userName);
        }
        if (pLower.contains("architecture") || pLower.contains("tech stack") || pLower.contains("system")) {
            return "This Enterprise AI Workspace combines a Spring Boot 3 reactive backend (RBAC security, PostgreSQL pgvector embeddings, STOMP real-time broker) with an Apple visionOS-inspired spatial React frontend. All data pipelines support both local Ollama execution and enterprise cloud models.";
        }
        return String.format("Hello %s! I'm your %s. How can I assist you with tasks, knowledge retrieval, or workspace operations today?", userName, getAssistantDisplayName(assistant));
    }

    // Internal helper record for tool execution
    private static class ToolResult {
        private final String status;
        private final String summary;
        private final String outputJson;
        private final boolean stateMutated;

        public ToolResult(String status, String summary, String outputJson, boolean stateMutated) {
            this.status = status;
            this.summary = summary;
            this.outputJson = outputJson;
            this.stateMutated = stateMutated;
        }

        public String getStatus() { return status; }
        public String getSummary() { return summary; }
        public String getOutputJson() { return outputJson; }
        public boolean isStateMutated() { return stateMutated; }
    }
}
