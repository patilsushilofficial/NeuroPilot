import { StateCreator } from 'zustand';
import { Task, TaskPriority, TaskStatus, SubTask } from '../../types';
import { taskService } from '../../services/TaskService';

export interface TasksSlice {
  tasks: Task[];

  // CRUD
  addTask: (payload: Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'estimatedMinutes' | 'tags'> & { subtasks?: Pick<SubTask, 'title'>[] }) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => number; // returns xp earned

  // Subtasks
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Queries
  getTaskById: (id: string) => Task | undefined;
  getTodaysTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getPendingTasks: () => Task[];
}

export const createTasksSlice: StateCreator<TasksSlice, [], [], TasksSlice> = (set, get) => ({
  tasks: [],

  addTask: (payload) => {
    // 1. Service handles complex generation (IDs, defaults, XP mapping) and queues the background sync.
    const task = taskService.createTask(payload);

    // 2. Zustand handles the immediate UI update (Optimistic Update)
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task.id;
  },

  updateTask: (id, updates) => {
    // 1. Service handles sending to backend in the background
    taskService.updateTask(id, updates);

    // 2. Zustand handles the instant UI update
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
      ),
    }));
  },

  deleteTask: (id) => {
    // 1. Queue deletion
    taskService.deleteTask(id);

    // 2. Remove from UI instantly
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  completeTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task || task.status === 'completed') return 0;

    // Background sync
    taskService.updateTask(id, { status: 'completed', completedAt: Date.now() });

    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, status: 'completed', completedAt: Date.now(), updatedAt: Date.now() }
          : t
      ),
    }));

    return task.xpReward;
  },

  addSubtask: (taskId, title) => {
    const sub: SubTask = { id: taskService.generateSubtaskId(), title, completed: false };
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, sub], updatedAt: Date.now() }
          : t
      ),
    }));
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
              updatedAt: Date.now(),
            }
          : t
      ),
    }));
  },

  deleteSubtask: (taskId, subtaskId) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId), updatedAt: Date.now() }
          : t
      ),
    }));
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  getTodaysTasks: () => {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return get().tasks.filter((t) => {
      if (t.status === 'completed') return false;
      if (!t.dueDate) return true; // no due date = always relevant
      return t.dueDate >= startOfDay.getTime() && t.dueDate <= endOfDay.getTime();
    });
  },

  getOverdueTasks: () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return get().tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate < startOfDay.getTime()
    );
  },

  getPendingTasks: () =>
    get().tasks.filter((t) => t.status !== 'completed'),
});
