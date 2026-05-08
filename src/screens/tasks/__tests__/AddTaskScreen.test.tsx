import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import { AddTaskScreen } from '../AddTaskScreen';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ onChange }: any) => {
      const handler = (event?: any, date?: Date) =>
        onChange?.(event ?? { type: 'set' }, date ?? new Date('2030-01-01T00:00:00'));
      return <View testID="datetime-picker" onTouchStart={() => handler()} />;
    },
  };
});

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primary: '#007AFF',
      primaryLight: '#5599FF',
      primaryContainer: '#E6F0FF',
      card: '#F5F5F5',
      border: '#CCCCCC',
      error: '#FF3B30',
    },
    text: {
      h4: {},
      bodyMedium: {},
      bodySmall: {},
      labelSmall: {},
      labelMedium: {},
    },
    mode: 'light',
    colorScheme: 'light',
  }),
}));

const mockHaptics = {
  light: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigation = { goBack: jest.fn() };
const mockRoute: { params: any } = { params: {} };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

const mockAddTask = jest.fn();
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();
const mockGetTaskById = jest.fn();

jest.mock('../../../store', () => ({
  useAppStore: () => ({
    addTask: mockAddTask,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    getTaskById: mockGetTaskById,
  }),
}));

describe('AddTaskScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute.params = {};
    mockGetTaskById.mockReturnValue(undefined);
  });

  it('renders new-task form initially', () => {
    const { getByText, getByPlaceholderText } = render(<AddTaskScreen />);
    expect(getByText('New Task')).toBeTruthy();
    expect(getByPlaceholderText('What needs to be done?')).toBeTruthy();
  });

  it('reveals advanced fields after entering a title and saves a new task', () => {
    const { getByPlaceholderText, getByText } = render(<AddTaskScreen />);
    const input = getByPlaceholderText('What needs to be done?');
    fireEvent.changeText(input, 'Write report');

    fireEvent.press(getByText('High'));
    fireEvent.press(getByText('30m'));
    fireEvent.press(getByText('30m'));

    const subtaskInput = getByPlaceholderText('Add a step…');
    fireEvent.changeText(subtaskInput, 'Outline');
    fireEvent(subtaskInput, 'submitEditing');

    fireEvent.press(getByText('Save'));

    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Write report',
        priority: 'high',
        subtasks: [{ title: 'Outline' }],
      })
    );
    expect(mockHaptics.success).toHaveBeenCalled();
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('does not save when title is empty', () => {
    const { getByText } = render(<AddTaskScreen />);
    fireEvent.press(getByText('Save'));
    expect(mockAddTask).not.toHaveBeenCalled();
  });

  it('navigates back on cancel', () => {
    const { getByLabelText } = render(<AddTaskScreen />);
    fireEvent.press(getByLabelText('Go back'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('renders edit-task form when taskId provided and updates the task', () => {
    mockRoute.params = { taskId: 'task_1' };
    mockGetTaskById.mockReturnValue({
      id: 'task_1',
      title: 'Existing',
      description: 'Notes',
      priority: 'low',
      dueDate: Date.now() + 86_400_000,
      estimatedMinutes: 15,
      subtasks: [{ id: 'sub_1', title: 'Step 1', completed: false }],
    });

    const { getByText, getByPlaceholderText, getByDisplayValue } = render(<AddTaskScreen />);
    expect(getByText('Edit Task')).toBeTruthy();
    expect(getByDisplayValue('Existing')).toBeTruthy();
    expect(getByText('Step 1')).toBeTruthy();

    const titleInput = getByPlaceholderText('What needs to be done?');
    fireEvent.changeText(titleInput, 'Updated title');

    fireEvent.press(getByText('Save'));
    expect(mockUpdateTask).toHaveBeenCalledWith(
      'task_1',
      expect.objectContaining({ title: 'Updated title' })
    );
  });

  it('shows delete confirmation and deletes when confirmed', () => {
    mockRoute.params = { taskId: 'task_2' };
    mockGetTaskById.mockReturnValue({
      id: 'task_2',
      title: 'Delete me',
      priority: 'medium',
      subtasks: [],
    });

    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<AddTaskScreen />);

    fireEvent.press(getByText('🗑  Delete Task'));
    expect(alertSpy).toHaveBeenCalled();

    const buttons = alertSpy.mock.calls[0][2];
    const confirm = buttons?.find((b) => b.text === 'Delete');
    act(() => {
      confirm?.onPress?.();
    });

    expect(mockHaptics.warning).toHaveBeenCalled();
    expect(mockDeleteTask).toHaveBeenCalledWith('task_2');
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('opens date picker, sets a date and clears it', () => {
    const { getByPlaceholderText, getByLabelText, getByTestId } = render(<AddTaskScreen />);
    const input = getByPlaceholderText('What needs to be done?');
    fireEvent.changeText(input, 'With deadline');

    fireEvent.press(getByLabelText('Set due date'));
    fireEvent(getByTestId('datetime-picker'), 'touchStart');

    expect(getByLabelText(/Due date:/)).toBeTruthy();
  });

  it('toggles estimated minutes when same chip pressed twice', () => {
    const { getByPlaceholderText, getByText } = render(<AddTaskScreen />);
    fireEvent.changeText(getByPlaceholderText('What needs to be done?'), 'Toggle test');
    fireEvent.press(getByText('5m'));
    fireEvent.press(getByText('5m'));
    fireEvent.press(getByText('Save'));
    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({ estimatedMinutes: undefined })
    );
  });

  it('removes a subtask via the inline remove button', () => {
    const { getByPlaceholderText, getAllByText, queryByText } = render(<AddTaskScreen />);
    fireEvent.changeText(getByPlaceholderText('What needs to be done?'), 'Has steps');

    const sub = getByPlaceholderText('Add a step…');
    fireEvent.changeText(sub, 'A');
    fireEvent(sub, 'submitEditing');

    expect(queryByText('A')).toBeTruthy();
    const xs = getAllByText('✕');
    fireEvent.press(xs[0]);
    expect(queryByText('A')).toBeNull();
  });
});
