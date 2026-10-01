package com.example.ai_chat_app.dto;

public class DocumentSearchMatch {
    private String documentName;
    private int chunkIndex;
    private String content;
    private double distance;

    public DocumentSearchMatch() {}

    public DocumentSearchMatch(String documentName, int chunkIndex, String content, double distance) {
        this.documentName = documentName;
        this.chunkIndex = chunkIndex;
        this.content = content;
        this.distance = distance;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public int getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(int chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }
}
