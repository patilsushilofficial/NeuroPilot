import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TasksScreen } from '../TasksScreen';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      textOnPrimary: '#FFFFFF',
      primary: '#7B6CF6',
      primaryContainer: 'rgba(123, 108, 246, 0.12)',
      surface: '#FFFFFF',
      card: '#F5F5F5',
      border: '#CCCCCC',
      success: '#34C759',
      successContainer: 'rgba(52, 199, 89, 0.1)',
      error: '#FF3B30',
      errorContainer: 'rgba(255, 59, 48, 0.1)',
      warning: '#FF9500',
      taskHighPriority: '#FF3B30',
      taskMediumPriority: '#FF9F0A',
      taskLowPriority: '#34C759',
    },
    text: {
      h1: {},
      h2: {},
      bodySmall: {},
      bodyMedium: {},
      labelSmall: {},
      labelMedium: {},
      labelLarge: {},
    },
  }),
}));

const mockHaptics = {
  success: jest.fn(),
  light: jest.fn(),
  warning: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

const mockTasks = [
  {
    id: 'task_1',
    title: 'Task 1',
    status: 'pending',
    priority: 'medium',
    dueDate: NOW,
    subtasks: [],
    xpReward: 10,
  },
  {
    id: 'task_2',
    title: 'Task 2',
    status: 'pending',
    priority: 'high',
    dueDate: NOW,
    subtasks: [],
    xpReward: 15,
  },
  {
    id: 'task_3',
    title: 'Task 3',
    status: 'completed',
    priority: 'low',
    dueDate: NOW,
    subtasks: [],
    xpReward: 5,
  },
];

const overdueTask = {
  id: 'task_4',
  title: 'Overdue task',
  status: 'pending',
  priority: 'high',
  dueDate: NOW - 5 * DAY,
  subtasks: [],
  xpReward: 20,
};

const mockUseAppStore = {
  tasks: mockTasks as any[],
  getTodaysTasks: jest.fn(() =>
    mockUseAppStore.tasks.filter(
      (t: any) => t.status !== 'completed' && (!t.dueDate || Math.abs(t.dueDate - NOW) <= DAY)
    )
  ),
  getOverdueTasks: jest.fn(() =>
    mockUseAppStore.tasks.filter(
      (t: any) => t.status !== 'completed' && t.dueDate && t.dueDate < NOW - DAY
    )
  ),
  getPendingTasks: jest.fn(() =>
    mockUseAppStore.tasks.filter((t: any) => t.status !== 'completed')
  ),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTask: jest.fn(),
  completeTask: jest.fn().mockReturnValue(0),
  addXP: jest.fn(),
  recordTaskComplete: jest.fn(),
};

jest.mock('../../../store', () => ({
  useAppStore: (selector: any) => (selector ? selector(mockUseAppStore) : mockUseAppStore),
}));

describe('TasksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppStore.tasks = mockTasks;
  });

  it('renders the title and pending subtitle', () => {
    const { getByText } = render(<TasksScreen />);
    expect(getByText('Tasks')).toBeTruthy();
    expect(getByText(/pending/)).toBeTruthy();
  });

  it('renders pending tasks under the Pending section by default', () => {
    const { getByText, queryByText } = render(<TasksScreen />);
    expect(getByText('Pending')).toBeTruthy();
    expect(getByText('Task 1')).toBeTruthy();
    expect(getByText('Task 2')).toBeTruthy();
    expect(queryByText('Task 3')).toBeNull();
  });

  it('surfaces an Overdue section when overdue tasks exist', () => {
    mockUseAppStore.tasks = [...mockTasks, overdueTask];
    const { getByText } = render(<TasksScreen />);
    expect(getByText('Overdue')).toBeTruthy();
    expect(getByText('Overdue task')).toBeTruthy();
    // Subtitle counter — pattern is unique because no other element
    // contains the literal " · N overdue" string.
    expect(getByText(/· 1 overdue/)).toBeTruthy();
  });

  it('renders an empty-state message with no inline CTA when there are no tasks', () => {
    // The extended FAB at the bottom is the only "Add task" affordance —
    // we used to also render a button inside the EmptyState but that
    // duplicated the action and competed for attention.
    mockUseAppStore.tasks = [];
    const { getByText, queryByText, getByLabelText } = render(<TasksScreen />);
    expect(getByText('Brain clear!')).toBeTruthy();
    expect(queryByText('Add a task')).toBeNull();

    fireEvent.press(getByLabelText('Add task'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddTask');
  });

  it('switches to the Done filter via the segmented control', () => {
    const { getByText, getByLabelText, queryByText } = render(<TasksScreen />);
    fireEvent.press(getByLabelText('Show completed tasks'));
    expect(getByText('Completed')).toBeTruthy();
    expect(getByText('Task 3')).toBeTruthy();
    expect(queryByText('Task 1')).toBeNull();
  });

  it('renders the today filter via the segmented control', () => {
    const { getByLabelText } = render(<TasksScreen />);
    fireEvent.press(getByLabelText("Show today's tasks"));
    expect(mockUseAppStore.getTodaysTasks).toHaveBeenCalled();
  });

  it('navigates to AddTask via the extended FAB', () => {
    const { getByLabelText, getByText } = render(<TasksScreen />);
    // The extended FAB renders both an icon AND a visible "Add task"
    // label — assert both so a regression to a label-less compact FAB
    // is caught.
    expect(getByText('Add task')).toBeTruthy();
    fireEvent.press(getByLabelText('Add task'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddTask');
  });

  it('navigates to AddTask with the task id when a card is pressed', () => {
    const { getByText } = render(<TasksScreen />);
    fireEvent.press(getByText('Task 1'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddTask', {
      taskId: 'task_1',
    });
  });

  it('completes a task with XP and triggers haptics', () => {
    jest.useFakeTimers();
    mockUseAppStore.completeTask.mockReturnValueOnce(50);
    const { getAllByRole } = render(<TasksScreen />);
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    jest.advanceTimersByTime(300);
    expect(mockUseAppStore.completeTask).toHaveBeenCalled();
    expect(mockUseAppStore.addXP).toHaveBeenCalledWith(50);
    expect(mockUseAppStore.recordTaskComplete).toHaveBeenCalled();
    expect(mockHaptics.success).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('confirms deletion via long-press alert', () => {
    const { Alert } = require('react-native');
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<TasksScreen />);
    fireEvent(getByText('Task 1'), 'longPress');
    expect(alertSpy).toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0][2];
    const confirm = buttons?.find((b: any) => b.text === 'Delete');
    confirm?.onPress?.();
    expect(mockUseAppStore.deleteTask).toHaveBeenCalledWith('task_1');
    expect(mockHaptics.warning).toHaveBeenCalled();
  });
});
