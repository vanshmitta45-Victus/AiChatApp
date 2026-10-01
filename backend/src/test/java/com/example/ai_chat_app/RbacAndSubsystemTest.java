package com.example.ai_chat_app;

import com.example.ai_chat_app.dto.*;
import com.example.ai_chat_app.model.Conversation;
import com.example.ai_chat_app.model.ConversationParticipant;
import com.example.ai_chat_app.model.Note;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.*;
import com.example.ai_chat_app.service.ChatService;
import com.example.ai_chat_app.service.MediaStorageService;
import com.example.ai_chat_app.service.NoteService;
import com.example.ai_chat_app.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.io.File;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class RbacAndSubsystemTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private ChatService chatService;

    @Autowired
    private MediaStorageService mediaStorageService;

    @Autowired
    private UserService userService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageMentionRepository messageMentionRepository;

    @Autowired
    private NoteRepository noteRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    // ---------------------------------------------------------------------------------------------
    // Requirement 1 & 2: Security & RBAC (/api/admin/users/**)
    // ---------------------------------------------------------------------------------------------

    @Test
    @WithMockUser(username = "adminUser", roles = {"ADMIN"})
    void adminShouldAccessAdminUsersEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "managerUser", roles = {"MANAGER"})
    void managerShouldAccessAdminUsersEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "teamLeaderUser", roles = {"TEAM_LEADER"})
    void teamLeaderShouldGet403ForbiddenOnAdminUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "staffUser", roles = {"STAFF"})
    void staffShouldGet403ForbiddenOnAdminUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedUserShouldGet401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "adminUser", roles = {"ADMIN"})
    void adminShouldCreateAndUpdateUserSuccessfully() throws Exception {
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        CreateUserRequest createReq = new CreateUserRequest();
        createReq.setUsername("testuser_" + uniqueSuffix);
        createReq.setEmail("test_" + uniqueSuffix + "@company.com");
        createReq.setPassword("secretPass123");
        createReq.setFullName("Test User " + uniqueSuffix);
        createReq.setRole("STAFF");
        createReq.setDepartment("Customer Support");

        // 1. POST /api/admin/users
        MvcResult postResult = mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.username").value("testuser_" + uniqueSuffix))
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn();

        long createdUserId = objectMapper.readTree(postResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. PUT /api/admin/users/{id}
        UpdateUserRequest updateReq = new UpdateUserRequest();
        updateReq.setDepartment("DevOps");
        updateReq.setRole("TEAM_LEADER");
        updateReq.setStatus("SUSPENDED");

        mockMvc.perform(put("/api/admin/users/" + createdUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department").value("DevOps"))
                .andExpect(jsonPath("$.role").value("TEAM_LEADER"))
                .andExpect(jsonPath("$.status").value("SUSPENDED"));
    }

    // ---------------------------------------------------------------------------------------------
    // Requirement 3: WebSocket & Messaging Subsystem (Topologies & Mentions)
    // ---------------------------------------------------------------------------------------------

    @Test
    void mentionExtractorShouldExtractUsernames() {
        String message = "Hello @admin and @teamleader, please check the report! CC @sam_staff";
        List<String> mentions = chatService.extractMentions(message);

        assertEquals(3, mentions.size());
        assertTrue(mentions.contains("admin"));
        assertTrue(mentions.contains("teamleader"));
        assertTrue(mentions.contains("sam_staff"));
    }

    @Test
    void staffShouldBeRejectedWhenPublishingToOneToManyBroadcast() {
        // Find or create ONE_TO_MANY conversation
        Conversation broadcastConv = conversationRepository.findByType("ONE_TO_MANY").stream().findFirst().orElseGet(() -> {
            User admin = userRepository.findByUsername("admin").orElseThrow();
            Conversation c = new Conversation("ONE_TO_MANY", "Company Broadcasts", "Desc", admin);
            return conversationRepository.save(c);
        });

        // Ensure staff user exists
        User staffUser = userRepository.findByUsername("staff").orElseThrow();

        ChatMessageRequest chatReq = new ChatMessageRequest();
        chatReq.setConversationId(broadcastConv.getId());
        chatReq.setContent("Unauthorized broadcast announcement attempt by staff");
        chatReq.setMessageType("TEXT");

        // STAFF publishing to ONE_TO_MANY must fail with AccessDeniedException
        assertThrows(AccessDeniedException.class, () -> {
            chatService.processAndSendMessage(chatReq, staffUser.getUsername());
        });
    }

    @Test
    void adminCanPublishToOneToManyBroadcastAndTriggerMentions() {
        Conversation broadcastConv = conversationRepository.findByType("ONE_TO_MANY").stream().findFirst().orElseGet(() -> {
            User admin = userRepository.findByUsername("admin").orElseThrow();
            Conversation c = new Conversation("ONE_TO_MANY", "Company Broadcasts", "Desc", admin);
            return conversationRepository.save(c);
        });

        User admin = userRepository.findByUsername("admin").orElseThrow();
        User staff = userRepository.findByUsername("staff").orElseThrow();

        ChatMessageRequest chatReq = new ChatMessageRequest();
        chatReq.setConversationId(broadcastConv.getId());
        chatReq.setContent("Urgent all-hands meeting! @staff please attend on time.");
        chatReq.setMessageType("TEXT");

        ChatMessageResponse response = chatService.processAndSendMessage(chatReq, admin.getUsername());

        assertNotNull(response.getId());
        assertEquals("admin", response.getSenderUsername());
        assertTrue(response.getMentions().contains("staff"));

        // Verify message mentions persisted in DB
        var mentions = messageMentionRepository.findByMentionedUserIdAndIsReadFalse(staff.getId());
        assertFalse(mentions.isEmpty());
    }

    // ---------------------------------------------------------------------------------------------
    // Requirement 4: Media & Location Storage
    // ---------------------------------------------------------------------------------------------

    @Test
    void mediaStorageServiceShouldDetectMediaTypesCorrectly() {
        assertEquals("IMAGE", mediaStorageService.detectMessageType("image/png", "screenshot.png"));
        assertEquals("IMAGE", mediaStorageService.detectMessageType("image/jpeg", "photo.jpg"));
        assertEquals("VIDEO", mediaStorageService.detectMessageType("video/mp4", "recording.mp4"));
        assertEquals("AUDIO", mediaStorageService.detectMessageType("audio/mpeg", "voice_note.mp3"));
        assertEquals("DOCUMENT", mediaStorageService.detectMessageType("application/pdf", "manual.pdf"));
        assertEquals("DOCUMENT", mediaStorageService.detectMessageType("text/plain", "notes.txt"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void mediaControllerShouldUploadFileAndReturnAccessUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample-diagram.png",
                "image/png",
                "fake image content binary data".getBytes()
        );

        MvcResult result = mockMvc.perform(multipart("/api/media/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.file_url").value(org.hamcrest.Matchers.startsWith("/uploads/")))
                .andExpect(jsonPath("$.file_name").value("sample-diagram.png"))
                .andExpect(jsonPath("$.message_type").value("IMAGE"))
                .andReturn();

        MediaUploadResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                MediaUploadResponse.class
        );

        // Verify physical file was written to disk in uploadDir
        String relativePath = response.getFileUrl().replace("/uploads/", "");
        File uploadedDiskFile = mediaStorageService.getFileStorageLocation().resolve(relativePath).toFile();
        assertTrue(uploadedDiskFile.exists());
    }

    @Test
    void locationMessageShouldStoreCoordinatesAndLabel() {
        Conversation groupConv = conversationRepository.findByType("MANY_TO_MANY").stream().findFirst().orElseGet(() -> {
            User admin = userRepository.findByUsername("admin").orElseThrow();
            Conversation c = new Conversation("MANY_TO_MANY", "Group Chat", "Desc", admin);
            return conversationRepository.save(c);
        });

        User admin = userRepository.findByUsername("admin").orElseThrow();

        ChatMessageRequest locReq = new ChatMessageRequest();
        locReq.setConversationId(groupConv.getId());
        locReq.setContent("Current office location");
        locReq.setMessageType("LOCATION");
        locReq.setLatitude(37.7749);
        locReq.setLongitude(-122.4194);
        locReq.setLocationLabel("San Francisco HQ");

        ChatMessageResponse response = chatService.processAndSendMessage(locReq, admin.getUsername());

        assertNotNull(response.getId());
        assertEquals("LOCATION", response.getMessageType());
        assertEquals(37.7749, response.getLatitude());
        assertEquals(-122.4194, response.getLongitude());
        assertEquals("San Francisco HQ", response.getLocationLabel());
    }

    // ---------------------------------------------------------------------------------------------
    // Requirement 5: Google Keep-Style Notes Service (/api/notes)
    // ---------------------------------------------------------------------------------------------

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void noteServiceShouldPerformFullKeepCrudCycle() throws Exception {
        // 1. Create Note (POST)
        NoteRequest noteReq = new NoteRequest();
        noteReq.setTitle("Sprint Planning Goals");
        noteReq.setContent("Deliver STOMP WebSocket broker and RBAC security layer.");
        noteReq.setColor("amber");
        noteReq.setIsPinned(true);
        noteReq.setTags(List.of("backend", "sprint-1", "java17"));

        MvcResult createResult = mockMvc.perform(post("/api/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Sprint Planning Goals"))
                .andExpect(jsonPath("$.color").value("amber"))
                .andExpect(jsonPath("$.is_pinned").value(true))
                .andExpect(jsonPath("$.tags[0]").value("backend"))
                .andReturn();

        long createdNoteId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Read Notes (GET /api/notes)
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].is_pinned").value(true));

        // 3. Toggle Archive (PATCH /api/notes/{id}/archive)
        mockMvc.perform(patch("/api/notes/" + createdNoteId + "/archive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.is_archived").value(true));

        // 4. Update Color (PATCH /api/notes/{id}/color)
        mockMvc.perform(patch("/api/notes/" + createdNoteId + "/color")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"color\": \"emerald\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.color").value("emerald"));

        // 5. Delete Note (DELETE /api/notes/{id})
        mockMvc.perform(delete("/api/notes/" + createdNoteId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Note deleted successfully"));
    }
}
