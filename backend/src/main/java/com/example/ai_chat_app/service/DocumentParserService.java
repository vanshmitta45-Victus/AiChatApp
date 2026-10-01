package com.example.ai_chat_app.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class DocumentParserService {

    @Value("${rag.chunk.size:500}")
    private int chunkSize;

    @Value("${rag.chunk.overlap:50}")
    private int chunkOverlap;

    public String extractText(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (fileName.endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } else {
            // Text, Markdown, CSV, etc.
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        }
    }

    public List<String> chunkText(String rawText) {
        return chunkText(rawText, this.chunkSize, this.chunkOverlap);
    }

    public List<String> chunkText(String rawText, int size, int overlap) {
        if (rawText == null || rawText.isBlank()) {
            return Collections.emptyList();
        }

        // Normalize line breaks and duplicate spaces
        String normalized = rawText.replaceAll("\\r\\n", "\n")
                .replaceAll("[ \\t]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();

        List<String> chunks = new ArrayList<>();
        if (normalized.length() <= size) {
            chunks.add(normalized);
            return chunks;
        }

        int start = 0;
        while (start < normalized.length()) {
            int end = Math.min(start + size, normalized.length());

            // Avoid breaking in the middle of a word if possible
            if (end < normalized.length()) {
                int lastSpace = normalized.lastIndexOf(' ', end);
                int lastNewline = normalized.lastIndexOf('\n', end);
                int bestBreak = Math.max(lastSpace, lastNewline);
                if (bestBreak > start + (size / 2)) {
                    end = bestBreak;
                }
            }

            String chunk = normalized.substring(start, end).trim();
            if (!chunk.isEmpty()) {
                chunks.add(chunk);
            }

            if (end >= normalized.length()) {
                break;
            }

            start = end - overlap;
            if (start < 0) {
                start = 0;
            }
        }

        return chunks;
    }
}
