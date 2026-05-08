import { Task, SubTask } from '../types';
import { syncService } from './SyncService';
import { XP_REWARDS } from '../constants/focusPresets';

let taskIdCounter = Date.now();
const generateId = (prefix: string) => `${prefix}_${++taskIdCounter}_${Math.random().toString(36).slice(2, 7)}`;

/**
 * TaskService encapsulates all complex business logic and syncing
 * for tasks, keeping the Zustand slice pure and fast.
 */
class TaskService {
  createTask(payload: Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'estimatedMinutes' | 'tags'> & { subtasks?: Pick<SubTask, 'title'>[] }): Task {
    const id = generateId('task');
    const xpReward = XP_REWARDS.taskComplete[payload.priority];
    const subtasks: SubTask[] = (payload.subtasks ?? []).map((s) => ({
      id: generateId('sub'),
      title: s.title,
      completed: false,
    }));

    const task: Task = {
      id,
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      status: 'pending',
      dueDate: payload.dueDate,
      estimatedMinutes: payload.estimatedMinutes,
      tags: payload.tags ?? [],
      subtasks,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      xpReward,
    };

    // Trigger offline-first background sync
    syncService.queueAction({ type: 'CREATE_TASK', payload: task });

    return task;
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    // Queue the background sync without blocking the UI
    syncService.queueAction({ type: 'UPDATE_TASK', payload: { id, updates } });
  }

  deleteTask(id: string) {
    syncService.queueAction({ type: 'DELETE_TASK', payload: { id } });
  }

  generateSubtaskId(): string {
    return generateId('sub');
  }
}

export const taskService = new TaskService();
