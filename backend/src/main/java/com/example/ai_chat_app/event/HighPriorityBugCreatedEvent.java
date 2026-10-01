package com.example.ai_chat_app.event;

import com.example.ai_chat_app.model.Task;

public class HighPriorityBugCreatedEvent {

    private final Task task;
    private final String triggerSource;

    public HighPriorityBugCreatedEvent(Task task, String triggerSource) {
        this.task = task;
        this.triggerSource = triggerSource;
    }

    public Task getTask() {
        return task;
    }

    public String getTriggerSource() {
        return triggerSource;
    }
}
