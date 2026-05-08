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

  /**
   * Convert raw subtask titles (as captured by an edit form) into fully
   * realised `SubTask` records, dropping empty rows. Used when the form
   * issues an `updateTask` call and needs the canonical structured shape.
   */
  normalizeSubtasksForUpdate(titles: readonly string[]): SubTask[] {
    return titles
      .map((title) => title.trim())
      .filter((title) => title.length > 0)
      .map((title) => ({
        id: this.generateSubtaskId(),
        title,
        completed: false,
      }));
  }

  /**
   * Same as `normalizeSubtasksForUpdate`, but returns the lighter shape
   * accepted by `createTask`, which fills in IDs server-side (or rather,
   * service-side) when constructing the new task.
   */
  normalizeSubtasksForCreate(titles: readonly string[]): Pick<SubTask, 'title'>[] {
    return titles
      .map((title) => title.trim())
      .filter((title) => title.length > 0)
      .map((title) => ({ title }));
  }

  /**
   * Compute the {completed, total, ratio} progress numbers for a task's
   * subtasks. Returns `ratio: 0` when there are no subtasks so callers can
   * safely feed it into a width or progress bar without dividing by zero.
   */
  getSubtaskProgress(subtasks: readonly SubTask[]): {
    completed: number;
    total: number;
    ratio: number;
  } {
    const total = subtasks.length;
    const completed = subtasks.filter((s) => s.completed).length;
    const ratio = total > 0 ? completed / total : 0;
    return { completed, total, ratio };
  }
}

export const taskService = new TaskService();
