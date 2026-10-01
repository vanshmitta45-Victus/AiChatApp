package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.NoteDto;
import com.example.ai_chat_app.dto.NoteRequest;
import com.example.ai_chat_app.model.Note;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.NoteRepository;
import com.example.ai_chat_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoteDto> getUserNotes(String userIdentifier, Boolean isArchived) {
        User user = getUser(userIdentifier);
        List<Note> notes;
        if (isArchived != null) {
            notes = noteRepository.findByUserIdAndIsArchivedOrderByIsPinnedDescCreatedAtDesc(user.getId(), isArchived);
        } else {
            // By default return active (non-archived) notes
            notes = noteRepository.findByUserIdAndIsArchivedOrderByIsPinnedDescCreatedAtDesc(user.getId(), false);
        }
        return notes.stream().map(NoteDto::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoteDto getNoteById(Long noteId, String userIdentifier) {
        User user = getUser(userIdentifier);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteId));
        validateOwnership(note, user);
        return new NoteDto(note);
    }

    public NoteDto createNote(NoteRequest request, String userIdentifier) {
        User user = getUser(userIdentifier);

        Note note = new Note();
        note.setUser(user);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent() != null ? request.getContent().trim() : "");
        note.setColor(normalizeColor(request.getColor()));
        note.setIsPinned(Boolean.TRUE.equals(request.getIsPinned()));
        note.setIsArchived(Boolean.TRUE.equals(request.getIsArchived()));
        note.setTags(request.getTags() != null ? new ArrayList<>(request.getTags()) : new ArrayList<>());
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());

        Note saved = noteRepository.save(note);
        return new NoteDto(saved);
    }

    public NoteDto updateNote(Long noteId, NoteRequest request, String userIdentifier) {
        User user = getUser(userIdentifier);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteId));
        validateOwnership(note, user);

        if (request.getTitle() != null) {
            note.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            note.setContent(request.getContent().trim());
        }
        if (request.getColor() != null) {
            note.setColor(normalizeColor(request.getColor()));
        }
        if (request.getIsPinned() != null) {
            note.setIsPinned(request.getIsPinned());
        }
        if (request.getIsArchived() != null) {
            note.setIsArchived(request.getIsArchived());
        }
        if (request.getTags() != null) {
            note.setTags(new ArrayList<>(request.getTags()));
        }
        note.setUpdatedAt(LocalDateTime.now());

        Note updated = noteRepository.save(note);
        return new NoteDto(updated);
    }

    public void deleteNote(Long noteId, String userIdentifier) {
        User user = getUser(userIdentifier);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteId));
        validateOwnership(note, user);
        noteRepository.delete(note);
    }

    public NoteDto togglePin(Long noteId, String userIdentifier) {
        User user = getUser(userIdentifier);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteId));
        validateOwnership(note, user);

        note.setIsPinned(!Boolean.TRUE.equals(note.getIsPinned()));
        note.setUpdatedAt(LocalDateTime.now());
        return new NoteDto(noteRepository.save(note));
    }

    public NoteDto toggleArchive(Long noteId, String userIdentifier) {
        User user = getUser(userIdentifier);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteId));
        validateOwnership(note, user);

        note.setIsArchived(!Boolean.TRUE.equals(note.getIsArchived()));
        note.setUpdatedAt(LocalDateTime.now());
        return new NoteDto(noteRepository.save(note));
    }

    public NoteDto updateColor(Long noteId, String color, String userIdentifier) {
        User user = getUser(userIdentifier);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoSuchElementException("Note not found with id: " + noteId));
        validateOwnership(note, user);

        note.setColor(normalizeColor(color));
        note.setUpdatedAt(LocalDateTime.now());
        return new NoteDto(noteRepository.save(note));
    }

    private User getUser(String identifier) {
        return userRepository.findByUsernameOrEmailIgnoreCase(identifier)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + identifier));
    }

    private void validateOwnership(Note note, User user) {
        if (!note.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to access or modify this note");
        }
    }

    private String normalizeColor(String color) {
        if (color == null || color.isBlank()) {
            return "slate";
        }
        String clean = color.trim().toLowerCase();
        return switch (clean) {
            case "slate", "amber", "emerald", "blue", "indigo", "violet", "rose" -> clean;
            default -> "slate";
        };
    }
}
