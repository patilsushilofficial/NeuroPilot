# 🔄 User Flows & Workflows

This page contains visual flowcharts representing key user interactions and system processes within NeuroPilot.

---

## 1. Focus Session & Focus Shield Flow

This diagram illustrates the process of starting a focus session and how the Focus Shield interacts with system settings.

```mermaid
sequenceDiagram
    actor User
    participant UI as Focus Screen
    participant Store as Focus Slice
    participant Shield as FocusShieldService
    participant OS as Android/iOS System

    User->>UI: Tap "Start Focus"
    UI->>Store: startFocus()
    Store->>UI: Timer Starts (Running)

    User->>UI: Toggle "Focus Shield" ON
    UI->>Shield: activate()
    Shield->>OS: Cancel all App Notifications
    Shield->>OS: Open DND Settings Page
    OS-->>User: (User manually enables DND)

    Note over UI,OS: User works in deep focus...

    Store->>UI: Timer reaches 0:00
    UI->>Shield: deactivate()
    Shield->>OS: Restore cancelled notifications
    UI->>User: Vibrate & Notify Completion
```

---

## 2. Optimistic Task Creation Flow

This diagram shows how the app achieves zero-latency UI updates while maintaining backend synchronization.

```mermaid
graph TD
    A[User enters Task Title] -->|Tap Save| B(tasksSlice: addTask)
    B -->|1. Generate ID & XP| C(TaskService: createTask)
    C -->|2. Queue Sync Action| D(SyncService)
    D -->|3. Save to Queue| E[(MMKV)]

    B -->|4. Update State| F[Zustand Store]
    F -->|5. Re-render| G[UI: Task Appears Instantly]

    E -->|6. Background Process| H{Network Available?}
    H -->|Yes| I[Push to Remote API]
    H -->|No| J[Retry Later]
    I -->|Success| K[Remove from Queue]
```

---

[⬅ Back to Home](./README.md)
