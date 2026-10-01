package com.example.ai_chat_app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "document_analysis_chunks")
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnoreProperties({"uploader"})
    private DocumentUpload document;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "chunk_text", nullable = false, columnDefinition = "TEXT")
    private String chunkText;

    // Vector(768) embeddings represented as string for SQL or column definition
    @Column(name = "embedding", columnDefinition = "vector(768)")
    private String embedding;

    public DocumentChunk() {}

    public DocumentChunk(DocumentUpload document, Integer chunkIndex, String chunkText, String embedding) {
        this.document = document;
        this.chunkIndex = chunkIndex;
        this.chunkText = chunkText;
        this.embedding = embedding;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DocumentUpload getDocument() { return document; }
    public void setDocument(DocumentUpload document) { this.document = document; }

    public Integer getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(Integer chunkIndex) { this.chunkIndex = chunkIndex; }

    public String getChunkText() { return chunkText; }
    public void setChunkText(String chunkText) { this.chunkText = chunkText; }

    public String getEmbedding() { return embedding; }
    public void setEmbedding(String embedding) { this.embedding = embedding; }
}
