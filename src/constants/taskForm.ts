/**
 * Static configuration for the Add/Edit Task form. Pulled out of the screen
 * so layout (`AddTaskScreen`) and state logic (`useAddTaskScreen`) can both
 * consume the same options without re-declaring them.
 */
export interface TimeEstimateOption {
  /** Display label, e.g. "30m" or "1h". */
  label: string;
  /** Stored value as a string of minutes, kept as text since the form uses
   *  a `TextInput`-friendly representation. */
  value: string;
}

export const TIME_ESTIMATES: readonly TimeEstimateOption[] = [
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1h', value: '60' },
  { label: '2h', value: '120' },
] as const;
