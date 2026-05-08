/**
 * Copy and tints for the Focus Shield component. Pulled out so the brand
 * colour is reusable, and so alert prompt strings can be localised later
 * without touching the component.
 */

export const FOCUS_SHIELD_ACTIVE_COLOR = '#2A9DB5';
export const FOCUS_SHIELD_BG_ACTIVE = 'rgba(42, 157, 181, 0.12)';

export const FOCUS_SHIELD_ACTIVATE_PROMPT = {
  title: '🛡️ Activate Focus Shield?',
  message:
    'This will:\n\n• Silence all NeuroPilot notifications\n• Open your system Do Not Disturb settings so you can block all calls and alerts\n\nYour phone will be distraction-free for your entire session.',
  cancelLabel: 'Cancel',
  confirmLabel: 'Activate Shield',
};

export const FOCUS_SHIELD_DEACTIVATE_PROMPT = {
  title: '🛡️ Deactivate Focus Shield?',
  message:
    'All notifications will be restored. Remember to manually turn off Do Not Disturb if you enabled it.',
  cancelLabel: 'Keep Shield On',
  confirmLabel: 'Deactivate',
};
