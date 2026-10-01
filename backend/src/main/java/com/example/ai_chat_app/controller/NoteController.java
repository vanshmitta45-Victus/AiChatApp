package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.NoteDto;
import com.example.ai_chat_app.dto.NoteRequest;
import com.example.ai_chat_app.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteDto>> getNotes(
            @RequestParam(name = "archived", required = false) Boolean archived,
            Principal principal
    ) {
        String username = principal != null ? principal.getName() : null;
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<NoteDto> notes = noteService.getUserNotes(username, archived);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNoteById(@PathVariable("id") Long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : null;
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            NoteDto note = noteService.getNoteById(id, username);
            return ResponseEntity.ok(note);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createNote(@Valid @RequestBody NoteRequest request, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : null;
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            NoteDto note = noteService.createNote(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(note);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create note: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(
            @PathVariable("id") Long id,
            @RequestBody NoteRequest request,
            Principal principal
    ) {
        try {
            String username = principal != null ? principal.getName() : null;
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            NoteDto note = noteService.updateNote(id, request, username);
            return ResponseEntity.ok(note);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update note: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable("id") Long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : null;
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            noteService.deleteNote(id, username);
            return ResponseEntity.ok(Map.of("message", "Note deleted successfully", "id", id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete note: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<?> togglePin(@PathVariable("id") Long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : null;
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            NoteDto note = noteService.togglePin(id, username);
            return ResponseEntity.ok(note);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<?> toggleArchive(@PathVariable("id") Long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : null;
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            NoteDto note = noteService.toggleArchive(id, username);
            return ResponseEntity.ok(note);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/color")
    public ResponseEntity<?> updateColor(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        try {
            String username = principal != null ? principal.getName() : null;
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String color = body.getOrDefault("color", "slate");
            NoteDto note = noteService.updateColor(id, color, username);
            return ResponseEntity.ok(note);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
