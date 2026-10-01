package com.example.ai_chat_app.config;

import com.example.ai_chat_app.model.*;
import com.example.ai_chat_app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Seed the Standard Enterprise Accounts (Password: 1234)
        User vanshUser = userRepository.findByUsernameOrEmailIgnoreCase("vansh").orElseGet(() -> {
            User u = new User();
            u.setUsername("vansh");
            u.setEmail("vansh@company.com");
            u.setCreatedAt(LocalDateTime.now());
            return u;
        });
        vanshUser.setFullName("Vansh Mittal");
        vanshUser.setRole("ADMIN");
        vanshUser.setStatus("ACTIVE");
        vanshUser.setDepartment("Executive Leadership");
        vanshUser.setPassword(passwordEncoder.encode("1234"));
        vanshUser.setUpdatedAt(LocalDateTime.now());
        vanshUser = userRepository.save(vanshUser);

        User adminUser = userRepository.findByUsernameOrEmailIgnoreCase("admin").orElseGet(() -> {
            User u = new User();
            u.setUsername("admin");
            u.setEmail("admin@company.com");
            u.setCreatedAt(LocalDateTime.now());
            return u;
        });
        adminUser.setFullName("System Administrator");
        adminUser.setRole("ADMIN");
        adminUser.setStatus("ACTIVE");
        adminUser.setDepartment("Executive Leadership");
        adminUser.setPassword(passwordEncoder.encode("1234"));
        adminUser.setUpdatedAt(LocalDateTime.now());
        adminUser = userRepository.save(adminUser);

        User manager = userRepository.findByUsernameOrEmailIgnoreCase("manager").orElseGet(() -> {
            User u = new User();
            u.setUsername("manager");
            u.setEmail("manager@company.com");
            u.setCreatedAt(LocalDateTime.now());
            return u;
        });
        manager.setFullName("Sarah Jenkins");
        manager.setRole("MANAGER");
        manager.setStatus("ACTIVE");
        manager.setDepartment("Engineering Management");
        manager.setPassword(passwordEncoder.encode("1234"));
        manager.setUpdatedAt(LocalDateTime.now());
        manager = userRepository.save(manager);

        User leader = userRepository.findByUsernameOrEmailIgnoreCase("lead").orElseGet(() -> {
            User u = new User();
            u.setUsername("lead");
            u.setEmail("lead@company.com");
            u.setCreatedAt(LocalDateTime.now());
            return u;
        });
        leader.setFullName("Alex Rivera");
        leader.setRole("TEAM_LEADER");
        leader.setStatus("ACTIVE");
        leader.setDepartment("Core Engineering");
        leader.setPassword(passwordEncoder.encode("1234"));
        leader.setUpdatedAt(LocalDateTime.now());
        leader = userRepository.save(leader);

        User teamLeader = userRepository.findByUsernameOrEmailIgnoreCase("teamleader").orElseGet(() -> {
            User u = new User();
            u.setUsername("teamleader");
            u.setEmail("teamleader@company.com");
            u.setCreatedAt(LocalDateTime.now());
            return u;
        });
        teamLeader.setFullName("Alex Rivera");
        teamLeader.setRole("TEAM_LEADER");
        teamLeader.setStatus("ACTIVE");
        teamLeader.setDepartment("Core Engineering");
        teamLeader.setPassword(passwordEncoder.encode("1234"));
        teamLeader.setUpdatedAt(LocalDateTime.now());
        teamLeader = userRepository.save(teamLeader);

        User staff = userRepository.findByUsernameOrEmailIgnoreCase("staff").orElseGet(() -> {
            User u = new User();
            u.setUsername("staff");
            u.setEmail("staff@company.com");
            u.setCreatedAt(LocalDateTime.now());
            return u;
        });
        staff.setFullName("Sam Taylor");
        staff.setRole("STAFF");
        staff.setStatus("ACTIVE");
        staff.setDepartment("Product Operations");
        staff.setPassword(passwordEncoder.encode("1234"));
        staff.setUpdatedAt(LocalDateTime.now());
        staff = userRepository.save(staff);

        // 2. Seed Initial Multi-Topology Conversations if empty
        if (conversationRepository.count() == 0) {
            // Topology A: ONE_TO_MANY Broadcast channel
            Conversation broadcast = new Conversation("ONE_TO_MANY", "Company Announcements", "Official leadership broadcasts", vanshUser);
            broadcast.setCreatedAt(LocalDateTime.now());
            Conversation savedBroadcast = conversationRepository.save(broadcast);

            participantRepository.save(new ConversationParticipant(savedBroadcast, vanshUser, true));
            participantRepository.save(new ConversationParticipant(savedBroadcast, adminUser, true));
            participantRepository.save(new ConversationParticipant(savedBroadcast, manager, true));
            participantRepository.save(new ConversationParticipant(savedBroadcast, leader, true));
            participantRepository.save(new ConversationParticipant(savedBroadcast, teamLeader, true));
            participantRepository.save(new ConversationParticipant(savedBroadcast, staff, false));

            // Topology B: MANY_TO_MANY Group channel
            Conversation group = new Conversation("MANY_TO_MANY", "General Workspace", "Team collaborative chat & discussions", manager);
            group.setCreatedAt(LocalDateTime.now());
            Conversation savedGroup = conversationRepository.save(group);
            participantRepository.save(new ConversationParticipant(savedGroup, vanshUser, true));
            participantRepository.save(new ConversationParticipant(savedGroup, adminUser, true));
            participantRepository.save(new ConversationParticipant(savedGroup, manager, true));
            participantRepository.save(new ConversationParticipant(savedGroup, leader, true));
            participantRepository.save(new ConversationParticipant(savedGroup, teamLeader, true));
            participantRepository.save(new ConversationParticipant(savedGroup, staff, true));

            // Topology C: MANY_TO_ONE Helpdesk channel
            Conversation helpdesk = new Conversation("MANY_TO_ONE", "IT Support Helpdesk", "Report incidents to designated IT handler", staff);
            helpdesk.setTargetHandler(leader);
            helpdesk.setCreatedAt(LocalDateTime.now());
            Conversation savedHelpdesk = conversationRepository.save(helpdesk);
            participantRepository.save(new ConversationParticipant(savedHelpdesk, vanshUser, true));
            participantRepository.save(new ConversationParticipant(savedHelpdesk, adminUser, true));
            participantRepository.save(new ConversationParticipant(savedHelpdesk, staff, true));
            participantRepository.save(new ConversationParticipant(savedHelpdesk, leader, true));
            participantRepository.save(new ConversationParticipant(savedHelpdesk, manager, true));

            // Topology D: ONE_TO_ONE Direct Chat
            Conversation direct = new Conversation("ONE_TO_ONE", "Admin & Manager Direct", "Private direct messaging", vanshUser);
            direct.setCreatedAt(LocalDateTime.now());
            Conversation savedDirect = conversationRepository.save(direct);
            participantRepository.save(new ConversationParticipant(savedDirect, vanshUser, true));
            participantRepository.save(new ConversationParticipant(savedDirect, adminUser, true));
            participantRepository.save(new ConversationParticipant(savedDirect, manager, true));
        }

        // 3. Ensure both vansh and admin are enrolled in ALL conversations with full permissions
        List<Conversation> allConversations = conversationRepository.findAll();
        for (Conversation conv : allConversations) {
            if (participantRepository.findByConversationIdAndUserId(conv.getId(), vanshUser.getId()).isEmpty()) {
                participantRepository.save(new ConversationParticipant(conv, vanshUser, true));
            }
            if (participantRepository.findByConversationIdAndUserId(conv.getId(), adminUser.getId()).isEmpty()) {
                participantRepository.save(new ConversationParticipant(conv, adminUser, true));
            }
        }

        // 4. Seed Rich Media Messages if image message type is absent
        if (messageRepository.findAll().stream().noneMatch(m -> "IMAGE".equalsIgnoreCase(m.getMessageType())) && !allConversations.isEmpty()) {
            Conversation generalWorkspace = allConversations.stream()
                    .filter(c -> "MANY_TO_MANY".equalsIgnoreCase(c.getType()))
                    .findFirst()
                    .orElse(allConversations.get(0));

            Conversation announcements = allConversations.stream()
                    .filter(c -> "ONE_TO_MANY".equalsIgnoreCase(c.getType()))
                    .findFirst()
                    .orElse(allConversations.get(0));

            Conversation helpdesk = allConversations.stream()
                    .filter(c -> "MANY_TO_ONE".equalsIgnoreCase(c.getType()))
                    .findFirst()
                    .orElse(allConversations.get(0));

            Conversation directChat = allConversations.stream()
                    .filter(c -> "ONE_TO_ONE".equalsIgnoreCase(c.getType()))
                    .findFirst()
                    .orElse(allConversations.get(0));

            // Message 1: TEXT with @mentions in Announcements
            Message m1 = new Message(announcements, vanshUser,
                    "🚀 **Spatial Computing Design System & Enterprise AI Suite Launched!**\n\nWelcome team! Please coordinate testing of the STOMP broker, PostgreSQL pgvector RAG, and Jira Kanban lanes. CC @teamleader @staff @manager @admin",
                    "TEXT");
            messageRepository.save(m1);

            // Message 2: IMAGE in General Workspace
            Message m2 = new Message(generalWorkspace, leader,
                    "🖼️ Spatial UI Design System Preview",
                    "IMAGE");
            m2.setFileUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop");
            m2.setFileName("spatial-glass-mockup.png");
            m2.setFileSize(284900L);
            m2.setMimeType("image/png");
            messageRepository.save(m2);

            // Message 3: DOCUMENT in General Workspace
            Message m3 = new Message(generalWorkspace, manager,
                    "📎 Architecture_Specification_v2.pdf",
                    "DOCUMENT");
            m3.setFileUrl("/uploads/Architecture_Specification_v2.pdf");
            m3.setFileName("Architecture_Specification_v2.pdf");
            m3.setFileSize(524288L);
            m3.setMimeType("application/pdf");
            messageRepository.save(m3);

            // Message 4: LOCATION in Helpdesk
            Message m4 = new Message(helpdesk, staff,
                    "📍 Location: East Coast Data Center - Ashburn, VA",
                    "LOCATION");
            m4.setLatitude(39.0438);
            m4.setLongitude(-77.4874);
            m4.setLocationLabel("East Coast Data Center - Ashburn, VA");
            messageRepository.save(m4);

            // Message 5: AUDIO in Direct Chat
            Message m5 = new Message(directChat, leader,
                    "🎤 Voice Note: Sprint alignment (0:15)",
                    "AUDIO");
            m5.setFileUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
            m5.setFileName("sprint-voice-note.webm");
            m5.setFileSize(48000L);
            m5.setMimeType("audio/webm");
            messageRepository.save(m5);

            // Message 6: VIDEO in Direct Chat
            Message m6 = new Message(directChat, vanshUser,
                    "🎥 Spatial Dock & Command Palette Walkthrough",
                    "VIDEO");
            m6.setFileUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
            m6.setFileName("spatial-walkthrough.mp4");
            m6.setFileSize(1542000L);
            m6.setMimeType("video/mp4");
            messageRepository.save(m6);
        }

        // 5. Seed Keep Notes for vansh and admin if empty
        if (noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(vanshUser.getId()).isEmpty()) {
            Note n1 = new Note(vanshUser, "Spatial Computing Architecture", "Spring Boot 3 + PostgreSQL pgvector 768-dim embeddings with nomic-embed-text and cosine distance <=> operator.", "indigo");
            n1.setIsPinned(true);
            n1.setTags(List.of("Architecture", "Spatial UI", "AI"));
            noteRepository.save(n1);

            Note n2 = new Note(vanshUser, "RBAC Security Chain", "Identity Management endpoints (/api/admin/users/**) strictly require ADMIN or MANAGER role.", "emerald");
            n2.setIsPinned(false);
            n2.setTags(List.of("Security", "SpringSecurity", "RBAC"));
            noteRepository.save(n2);

            Note n3 = new Note(vanshUser, "Kanban Sprint Goals", "Verify drag-and-drop transitions across 6 lanes: Backlog -> To Do -> In Progress -> In Review -> Blocked -> Done.", "amber");
            n3.setIsPinned(false);
            n3.setTags(List.of("Jira", "Sprint", "Kanban"));
            noteRepository.save(n3);
        }

        if (noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(adminUser.getId()).isEmpty()) {
            Note an1 = new Note(adminUser, "System Security & Verification", "All REST endpoints and STOMP channels verified for production role compliance.", "emerald");
            an1.setIsPinned(true);
            an1.setTags(List.of("Compliance", "Security"));
            noteRepository.save(an1);
        }

        // 6. Seed Projects, Channels, Tickets & Tasks
        Project infra = projectRepository.findByKey("INFRA").orElse(null);
        if (infra == null) {
            infra = projectRepository.save(new Project("INFRA", "Infrastructure & Cloud", "Core IT infrastructure, networks, and cloud operations", vanshUser));
        }
        Project dev = projectRepository.findByKey("DEV").orElse(null);
        if (dev == null) {
            dev = projectRepository.save(new Project("DEV", "Application Development", "Core application platform and feature engineering", manager));
        }

        if (channelRepository.count() == 0) {
            channelRepository.save(new Channel("general", "All-company general discussion and announcements", "@helpdesk", infra));
            channelRepository.save(new Channel("it-support", "IT Helpdesk assistance and hardware requests", "@helpdesk", infra));
            channelRepository.save(new Channel("dev-team", "Engineering sprints and backlog triage", "@pm", dev));
        }

        if (ticketRepository.count() == 0) {
            Ticket t1 = new Ticket("INFRA-101", "VPN connection timeout for remote devs", "Engineers in remote regions report VPN handshake timeout after 30 seconds.", "OPEN", "HIGH", "BUG", infra, staff);
            ticketRepository.save(t1);

            Ticket t2 = new Ticket("DEV-201", "Fix PostgreSQL connection pool leak under heavy load", "HikariCP pool reaches 100% saturation during concurrent RAG vector query bursts.", "IN_PROGRESS", "CRITICAL", "BUG", dev, vanshUser);
            t2.setAssignee(vanshUser);
            ticketRepository.save(t2);
        }

        // 7. Seed Jira-Style 6 Sprint Lanes Tasks
        if (taskRepository.count() == 0) {
            Task task1 = new Task("NEX-101", dev, "Implement STOMP WebSocket channel security interceptor",
                    "Ensure CONNECT frames validate JWT token and reject unauthorized subscriptions to secure broker topics.", "DONE", "HIGH");
            task1.setStoryPoints(5);
            task1.setAssignee(leader);
            task1.setReporter(vanshUser);
            task1.setDueDate(LocalDate.now().plusDays(1));
            taskRepository.save(task1);

            Task task2 = new Task("NEX-102", dev, "Spatial UI Glassmorphism & Ambient Glowing Indicators",
                    "Style deep space background (#07090e) with ambient indigo/cyan glows and frosted pill docks.", "IN_PROGRESS", "URGENT");
            task2.setStoryPoints(8);
            task2.setAssignee(vanshUser);
            task2.setReporter(manager);
            task2.setDueDate(LocalDate.now().plusDays(3));
            taskRepository.save(task2);

            Task task3 = new Task("NEX-103", infra, "Configure pgvector HNSW index for Document RAG",
                    "Create cosine distance operator <=> index on document_chunks table for fast sub-second vector search.", "REVIEW", "HIGH");
            task3.setStoryPoints(5);
            task3.setAssignee(leader);
            task3.setReporter(vanshUser);
            task3.setDueDate(LocalDate.now().plusDays(4));
            taskRepository.save(task3);

            Task task4 = new Task("NEX-104", dev, "Ollama AST Bug Detection & Automated PR Code Review",
                    "Fetch pull request diffs and generate structured syntax bug reviews and refactor suggestions via local LLM.", "BLOCKED", "MEDIUM");
            task4.setStoryPoints(5);
            task4.setAssignee(manager);
            task4.setReporter(leader);
            task4.setDueDate(LocalDate.now().plusDays(8));
            taskRepository.save(task4);

            Task task5 = new Task("NEX-105", dev, "ATS Resume Scoring & OpenPDF CV Generator",
                    "Evaluate uploaded resumes against technical job criteria and export formatted PDF.", "TODO", "MEDIUM");
            task5.setStoryPoints(3);
            task5.setAssignee(staff);
            task5.setReporter(manager);
            task5.setDueDate(LocalDate.now().plusDays(7));
            taskRepository.save(task5);

            Task task6 = new Task("NEX-106", infra, "Cryptographic Immutable State Diff Audit Ledger",
                    "Tamper-proof audit logs recording entity mutations, actor principals, and IPs.", "BACKLOG", "LOW");
            task6.setStoryPoints(3);
            task6.setAssignee(vanshUser);
            task6.setReporter(adminUser);
            task6.setDueDate(LocalDate.now().plusDays(14));
            taskRepository.save(task6);
        }
    }
}
