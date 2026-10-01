package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.ChatMessageRequest;
import com.example.ai_chat_app.dto.ChatMessageResponse;
import com.example.ai_chat_app.dto.ConversationDto;
import com.example.ai_chat_app.dto.MentionNotificationDto;
import com.example.ai_chat_app.model.Conversation;
import com.example.ai_chat_app.model.ConversationParticipant;
import com.example.ai_chat_app.model.Message;
import com.example.ai_chat_app.model.MessageMention;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.ConversationParticipantRepository;
import com.example.ai_chat_app.repository.ConversationRepository;
import com.example.ai_chat_app.repository.MessageMentionRepository;
import com.example.ai_chat_app.repository.MessageRepository;
import com.example.ai_chat_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    private static final Pattern MENTION_PATTERN = Pattern.compile("(?:^|\\s)@([a-zA-Z0-9_.-]+)");

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageMentionRepository mentionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public ChatMessageResponse processAndSendMessage(ChatMessageRequest request, String senderIdentifier) {
        if (request.getConversationId() == null) {
            throw new IllegalArgumentException("Conversation ID is required");
        }

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new NoSuchElementException("Conversation not found with id: " + request.getConversationId()));

        User sender = null;
        if (senderIdentifier != null && !senderIdentifier.isBlank()) {
            sender = userRepository.findByUsernameOrEmailIgnoreCase(senderIdentifier)
                    .orElse(null);
        }

        if (sender == null) {
            throw new AccessDeniedException("Sender authentication required");
        }

        // 1. Enforce Topology permissions: ONE_TO_MANY (Broadcasts)
        String topology = conversation.getType() != null ? conversation.getType().toUpperCase() : "MANY_TO_MANY";
        if ("ONE_TO_MANY".equals(topology)) {
            String role = sender.getRole() != null ? sender.getRole().toUpperCase().replace("ROLE_", "") : "STAFF";
            boolean canPublishRole = role.equals("ADMIN") || role.equals("MANAGER") || role.equals("TEAM_LEADER");
            if (!canPublishRole) {
                throw new AccessDeniedException("STAFF role cannot publish to ONE_TO_MANY broadcast channels; only ADMIN, MANAGER, and TEAM_LEADER are permitted.");
            }
        }

        // 2. Check participant can_post flag if registered as participant
        Optional<ConversationParticipant> participantOpt = participantRepository.findByConversationIdAndUserId(
                conversation.getId(), sender.getId()
        );
        if (participantOpt.isPresent() && Boolean.FALSE.equals(participantOpt.get().getCanPost())) {
            throw new AccessDeniedException("You do not have permission to post messages in this conversation (can_post is false).");
        }

        // 3. Build & persist Message entity
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent());

        String messageType = request.getMessageType() != null && !request.getMessageType().isBlank()
                ? request.getMessageType().toUpperCase()
                : "TEXT";
        message.setMessageType(messageType);

        message.setFileUrl(request.getFileUrl());
        message.setFileName(request.getFileName());
        message.setFileSize(request.getFileSize());
        message.setMimeType(request.getMimeType());

        // Location coordinates and label
        message.setLatitude(request.getLatitude());
        message.setLongitude(request.getLongitude());
        message.setLocationLabel(request.getLocationLabel());
        message.setCreatedAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        // 4. Parse '@username' mentions, save to message_mentions, and send real-time notification frames
        List<String> mentionedUsernames = extractMentions(request.getContent());
        List<MessageMention> savedMentions = new ArrayList<>();

        for (String username : mentionedUsernames) {
            Optional<User> mentionedUserOpt = userRepository.findByUsernameIgnoreCase(username)
                    .or(() -> userRepository.findByEmailIgnoreCase(username));

            if (mentionedUserOpt.isPresent()) {
                User mentionedUser = mentionedUserOpt.get();
                // Avoid notifying the sender themselves if they mentioned their own name
                if (!mentionedUser.getId().equals(sender.getId())) {
                    MessageMention mention = new MessageMention(savedMessage, mentionedUser);
                    mention.setIsRead(false);
                    mention.setCreatedAt(LocalDateTime.now());
                    MessageMention savedMention = mentionRepository.save(mention);
                    savedMentions.add(savedMention);

                    // Push notification frame to /user/{username}/queue/mentions
                    MentionNotificationDto notification = new MentionNotificationDto(
                            savedMessage.getId(),
                            conversation.getId(),
                            sender.getUsername(),
                            sender.getFullName(),
                            savedMessage.getContent(),
                            savedMessage.getCreatedAt()
                    );
                    messagingTemplate.convertAndSendToUser(
                            mentionedUser.getUsername(),
                            "/queue/mentions",
                            notification
                    );
                }
            }
        }

        savedMessage.setMentions(savedMentions);
        ChatMessageResponse response = new ChatMessageResponse(savedMessage);

        // Broadcast frame to /topic/conversations/{conversationId}
        messagingTemplate.convertAndSend(
                "/topic/conversations/" + conversation.getId(),
                response
        );

        return response;
    }

    public List<String> extractMentions(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }
        Set<String> mentions = new LinkedHashSet<>();
        Matcher matcher = MENTION_PATTERN.matcher(text);
        while (matcher.find()) {
            String mention = matcher.group(1).trim();
            if (!mention.isBlank()) {
                mentions.add(mention);
            }
        }
        return new ArrayList<>(mentions);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversationMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(String username) {
        User user = userRepository.findByUsernameOrEmailIgnoreCase(username)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + username));
        return conversationRepository.findAllForUser(user.getId()).stream()
                .map(ConversationDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationDto getConversationById(Long id) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found: " + id));
        return new ConversationDto(conv);
    }

    public ConversationDto createConversation(ConversationDto dto, String creatorIdentifier) {
        User creator = userRepository.findByUsernameOrEmailIgnoreCase(creatorIdentifier)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + creatorIdentifier));

        Conversation conversation = new Conversation();
        conversation.setType(dto.getType() != null ? dto.getType().toUpperCase() : "MANY_TO_MANY");
        conversation.setTitle(dto.getTitle());
        conversation.setDescription(dto.getDescription());
        conversation.setCreatedBy(creator);
        conversation.setCreatedAt(LocalDateTime.now());

        if (dto.getTargetHandlerId() != null) {
            userRepository.findById(dto.getTargetHandlerId()).ifPresent(conversation::setTargetHandler);
        }

        Conversation saved = conversationRepository.save(conversation);

        // Add creator as participant
        ConversationParticipant creatorParticipant = new ConversationParticipant(saved, creator, true);
        participantRepository.save(creatorParticipant);

        // Add extra participants if provided
        if (dto.getParticipants() != null) {
            for (ConversationDto.ParticipantDto pDto : dto.getParticipants()) {
                if (pDto.getUserId() != null && !pDto.getUserId().equals(creator.getId())) {
                    userRepository.findById(pDto.getUserId()).ifPresent(u -> {
                        boolean canPost = pDto.getCanPost() != null ? pDto.getCanPost() : true;
                        // For ONE_TO_MANY broadcasts, regular STAFF default to canPost = false
                        if ("ONE_TO_MANY".equals(saved.getType()) && "STAFF".equalsIgnoreCase(u.getRole())) {
                            canPost = false;
                        }
                        ConversationParticipant p = new ConversationParticipant(saved, u, canPost);
                        participantRepository.save(p);
                    });
                }
            }
        }

        return new ConversationDto(saved);
    }
}
