package com.example.ai_chat_app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "channels")
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "general", "it-support", "dev-team"

    private String description;

    private boolean isDirectMessage = false;

    // Target assistant if this channel has a dedicated bot: e.g. "@helpdesk", "@pm", "@support"
    private String targetAssistant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    public Channel() {}

    public Channel(String name, String description, String targetAssistant, Project project) {
        this.name = name;
        this.description = description;
        this.targetAssistant = targetAssistant;
        this.project = project;
        this.isDirectMessage = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isDirectMessage() { return isDirectMessage; }
    public void setDirectMessage(boolean directMessage) { isDirectMessage = directMessage; }

    public String getTargetAssistant() { return targetAssistant; }
    public void setTargetAssistant(String targetAssistant) { this.targetAssistant = targetAssistant; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
}
