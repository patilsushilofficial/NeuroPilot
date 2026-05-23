import { createTasksSlice } from '../tasksSlice';
import { taskService } from '../../../services/TaskService';

jest.mock('../../../services/TaskService', () => ({
  taskService: {
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    generateSubtaskId: jest.fn().mockReturnValue('sub_1'),
  },
}));

jest.mock('../../../utils/notifications', () => ({
  scheduleTaskReminder: jest.fn().mockResolvedValue('notif_id'),
  cancelNotification: jest.fn(),
}));

describe('tasksSlice', () => {
  let set: jest.Mock;
  let get: jest.Mock;
  let slice: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const state = {
      tasks: [],
      settings: { notificationsEnabled: true },
      updateTask: jest.fn(),
    };

    set = jest.fn((fn) => {
      const updates = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, updates);
    });

    get = jest.fn(() => state);

    slice = createTasksSlice(set, get, {} as any);
  });

  it('should add a task', () => {
    const mockTask = { id: 'task_1', title: 'Test', dueDate: Date.now() };
    (taskService.createTask as jest.Mock).mockReturnValue(mockTask);

    slice.addTask({ title: 'Test' });

    expect(taskService.createTask).toHaveBeenCalled();
    expect(set).toHaveBeenCalled();
  });

  it('should complete a task', () => {
    const mockTask1 = {
      id: 'task_1',
      title: 'Test 1',
      status: 'pending',
      xpReward: 10,
      notificationId: 'notif_1',
    };
    const mockTask2 = { id: 'task_2', title: 'Test 2', status: 'pending', xpReward: 5 };
    const state = get();
    state.tasks = [mockTask1, mockTask2];

    const xp = slice.completeTask('task_1');

    expect(taskService.updateTask).toHaveBeenCalled();
    expect(xp).toBe(10);
    expect(set).toHaveBeenCalled();
  });

  it('should delete a task', () => {
    const mockTask = { id: 'task_1', title: 'Test', notificationId: 'notif_1' };
    get.mockReturnValue({ tasks: [mockTask] });

    slice.deleteTask('task_1');
    expect(taskService.deleteTask).toHaveBeenCalledWith('task_1');
  });

  it('should update a task', () => {
    const mockTask1 = { id: 'task_1', title: 'Test 1', status: 'pending' };
    const mockTask2 = { id: 'task_2', title: 'Test 2', status: 'pending' };
    const state = get();
    state.tasks = [mockTask1, mockTask2];

    slice.updateTask('task_1', { title: 'Updated' });

    expect(taskService.updateTask).toHaveBeenCalledWith('task_1', { title: 'Updated' });
    expect(set).toHaveBeenCalled();
  });

  it('should reschedule notification if dueDate changes', async () => {
    const mockTask1 = {
      id: 'task_1',
      title: 'Test 1',
      status: 'pending',
      notificationId: 'notif_1',
    };
    const mockTask2 = { id: 'task_2', title: 'Test 2', status: 'pending' };
    const state = get();
    state.tasks = [mockTask1, mockTask2];

    const { cancelNotification, scheduleTaskReminder } = require('../../../utils/notifications');

    slice.updateTask('task_1', { dueDate: Date.now() + 100000, title: 'Updated Title' });

    expect(cancelNotification).toHaveBeenCalledWith('notif_1');
    expect(scheduleTaskReminder).toHaveBeenCalled();

    await Promise.resolve(); // Flush promises
    expect(set).toHaveBeenCalled();
  });

  it('should add a subtask', () => {
    const mockTask = { id: 'task_1', title: 'Test', subtasks: [] };
    const state = get();
    state.tasks = [mockTask];

    slice.addSubtask('task_1', 'Subtask 1');
    expect(set).toHaveBeenCalled();
  });

  it('should toggle a subtask', () => {
    const mockTask = {
      id: 'task_1',
      title: 'Test',
      subtasks: [{ id: 'sub_1', title: 'Subtask 1', completed: false }],
    };
    const state = get();
    state.tasks = [mockTask];

    slice.toggleSubtask('task_1', 'sub_1');
    expect(set).toHaveBeenCalled();
  });

  it('should delete a subtask', () => {
    const mockTask = {
      id: 'task_1',
      title: 'Test',
      subtasks: [{ id: 'sub_1', title: 'Subtask 1', completed: false }],
    };
    const state = get();
    state.tasks = [mockTask];

    slice.deleteSubtask('task_1', 'sub_1');
    expect(set).toHaveBeenCalled();
  });

  it('should get task by id', () => {
    const mockTask = { id: 'task_1', title: 'Test' };
    const state = get();
    state.tasks = [mockTask];

    const task = slice.getTaskById('task_1');
    expect(task).toEqual(mockTask);
  });

  it('should get today tasks', () => {
    const mockTask = { id: 'task_1', title: 'Test', status: 'pending', dueDate: Date.now() };
    const state = get();
    state.tasks = [mockTask];

    const todayTasks = slice.getTodaysTasks();
    expect(todayTasks.length).toBe(1);
  });

  it('should get overdue tasks', () => {
    const mockTask = {
      id: 'task_1',
      title: 'Test',
      status: 'pending',
      dueDate: Date.now() - 86400000,
    };
    const state = get();
    state.tasks = [mockTask];

    const overdueTasks = slice.getOverdueTasks();
    expect(overdueTasks.length).toBe(1);
  });

  it('should get pending tasks', () => {
    const mockTask = { id: 'task_1', title: 'Test', status: 'pending' };
    const state = get();
    state.tasks = [mockTask];

    const pendingTasks = slice.getPendingTasks();
    expect(pendingTasks.length).toBe(1);
  });

  it('returns 0 from completeTask when task is missing or already completed', () => {
    const state = get();
    state.tasks = [{ id: 'task_1', title: 'Done', status: 'completed', xpReward: 10 }];
    expect(slice.completeTask('task_1')).toBe(0);
    expect(slice.completeTask('missing')).toBe(0);
  });

  it('schedules a notification when adding a task with a due date', async () => {
    const mockTask = {
      id: 'task_1',
      title: 'Test',
      dueDate: Date.now() + 86_400_000,
    };
    (taskService.createTask as jest.Mock).mockReturnValue(mockTask);
    const { scheduleTaskReminder } = require('../../../utils/notifications');
    scheduleTaskReminder.mockClear();

    slice.addTask({ title: 'Test', priority: 'medium', dueDate: mockTask.dueDate, tags: [] });
    await Promise.resolve();
    expect(scheduleTaskReminder).toHaveBeenCalled();
  });

  it('does not schedule a notification when notifications are disabled', () => {
    const state = get();
    state.settings = { notificationsEnabled: false };
    const mockTask = { id: 'task_1', title: 'Test', dueDate: Date.now() };
    (taskService.createTask as jest.Mock).mockReturnValue(mockTask);
    const { scheduleTaskReminder } = require('../../../utils/notifications');
    scheduleTaskReminder.mockClear();

    slice.addTask({ title: 'Test', priority: 'medium', tags: [] });
    expect(scheduleTaskReminder).not.toHaveBeenCalled();
  });

  it('does nothing when toggling subtasks on a missing task', () => {
    const state = get();
    state.tasks = [{ id: 'task_1', subtasks: [{ id: 's1', title: 'a', completed: false }] }];
    slice.toggleSubtask('task_2', 's1');
    expect(state.tasks[0].subtasks[0].completed).toBe(false);
  });

  it('returns the today range filter result', () => {
    const state = get();
    state.tasks = [
      { id: 't1', status: 'pending', dueDate: Date.now() }, // today
      { id: 't2', status: 'pending' }, // no due date
      { id: 't3', status: 'pending', dueDate: Date.now() + 7 * 86_400_000 }, // future
      { id: 't4', status: 'completed', dueDate: Date.now() }, // completed
    ];
    const today = slice.getTodaysTasks();
    expect(today.map((t: any) => t.id)).toEqual(expect.arrayContaining(['t1', 't2']));
    expect(today.find((t: any) => t.id === 't4')).toBeUndefined();
  });

  it('addSubtask, toggleSubtask and deleteSubtask only mutate the matching task', () => {
    const state = get();
    state.tasks = [
      { id: 'task_1', subtasks: [{ id: 'sub_1', title: 'old', completed: false }] },
      { id: 'task_2', subtasks: [{ id: 'sub_2', title: 'other', completed: false }] },
    ];
    slice.addSubtask('task_1', 'new');
    expect(state.tasks[0].subtasks.length).toBe(2);
    expect(state.tasks[1].subtasks.length).toBe(1);

    slice.toggleSubtask('task_1', 'sub_1');
    expect(state.tasks[0].subtasks[0].completed).toBe(true);
    expect(state.tasks[1].subtasks[0].completed).toBe(false);

    slice.deleteSubtask('task_1', 'sub_1');
    expect(state.tasks[0].subtasks.find((s: any) => s.id === 'sub_1')).toBeUndefined();
    expect(state.tasks[1].subtasks.length).toBe(1);
  });

  it('updateTask without dueDate does not reschedule notifications', () => {
    const { scheduleTaskReminder, cancelNotification } = require('../../../utils/notifications');
    const state = get();
    state.tasks = [{ id: 'task_1', title: 'A', notificationId: 'n1' }];
    scheduleTaskReminder.mockClear();
    cancelNotification.mockClear();
    slice.updateTask('task_1', { title: 'B' });
    expect(scheduleTaskReminder).not.toHaveBeenCalled();
    expect(cancelNotification).not.toHaveBeenCalled();
  });

  it('reschedules using existing title when title is not in the update', async () => {
    const { scheduleTaskReminder } = require('../../../utils/notifications');
    const state = get();
    state.tasks = [{ id: 'task_1', title: 'Existing', notificationId: 'n1' }];
    scheduleTaskReminder.mockClear();
    slice.updateTask('task_1', { dueDate: Date.now() + 86_400_000 });
    await Promise.resolve();
    expect(scheduleTaskReminder).toHaveBeenCalledWith('task_1', 'Existing', expect.any(Date));
  });

  it('completeTask leaves notification cancellation alone if there is no notificationId', () => {
    const { cancelNotification } = require('../../../utils/notifications');
    const state = get();
    state.tasks = [{ id: 'task_1', status: 'pending', xpReward: 10 }];
    cancelNotification.mockClear();
    expect(slice.completeTask('task_1')).toBe(10);
    expect(cancelNotification).not.toHaveBeenCalled();
  });
});
