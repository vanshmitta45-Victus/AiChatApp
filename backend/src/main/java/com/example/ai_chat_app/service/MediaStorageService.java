package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.MediaUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path fileStorageLocation;

    public MediaStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not initialize storage directory", ex);
        }
    }

    public MediaUploadResponse storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        String rawOriginalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        if (rawOriginalFilename.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + rawOriginalFilename);
        }

        // Determine MIME type and corresponding messageType
        String mimeType = file.getContentType();
        if (mimeType == null || mimeType.isBlank()) {
            mimeType = "application/octet-stream";
        }
        String messageType = detectMessageType(mimeType, rawOriginalFilename);

        // Sanitize file name and prepend UUID
        String fileExtension = "";
        int extIndex = rawOriginalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            fileExtension = rawOriginalFilename.substring(extIndex);
        }
        String baseName = extIndex > 0 ? rawOriginalFilename.substring(0, extIndex) : rawOriginalFilename;
        String sanitizedBaseName = baseName.replaceAll("[^a-zA-Z0-9_-]", "_");
        String uniqueFileName = UUID.randomUUID() + "_" + sanitizedBaseName + fileExtension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + uniqueFileName;
            return new MediaUploadResponse(
                    fileUrl,
                    rawOriginalFilename,
                    file.getSize(),
                    mimeType,
                    messageType
            );
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + rawOriginalFilename + ". Please try again!", ex);
        }
    }

    public String detectMessageType(String mimeType, String filename) {
        String lowerMime = mimeType != null ? mimeType.toLowerCase() : "";
        String lowerFilename = filename != null ? filename.toLowerCase() : "";

        if (lowerMime.startsWith("audio/") || lowerFilename.contains("voice-note") || lowerFilename.matches(".*\\.(mp3|wav|ogg|m4a|aac|weba)$")) {
            return "AUDIO";
        }
        if (lowerMime.startsWith("image/") || lowerFilename.matches(".*\\.(jpg|jpeg|png|gif|webp|svg|bmp)$")) {
            return "IMAGE";
        }
        if (lowerMime.startsWith("video/") || lowerFilename.matches(".*\\.(mp4|webm|mkv|mov|avi|flv)$")) {
            return "VIDEO";
        }
        return "DOCUMENT";
    }

    public Path getFileStorageLocation() {
        return fileStorageLocation;
    }
}
