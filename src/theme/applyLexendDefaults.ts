import React from 'react';
import { StyleSheet, Text, TextInput, TextStyle } from 'react-native';
import { lexendFamilyFor } from './lexend';
import { defaultFontFamily } from './typography';

type AnyComponent = {
  render?: (...args: any[]) => React.ReactElement;
  prototype?: { render?: (...args: any[]) => React.ReactElement };
  defaultProps?: { style?: any };
};

const PATCHED_FLAG = '__lexendPatched__';

/**
 * Wraps a single render function so that any returned element without an
 * explicit `fontFamily` gets the Lexend variant matching its `fontWeight`.
 * Inline weights, StyleSheet weights, theme styles — all are covered.
 */
const wrapRender = (originalRender: (...args: any[]) => React.ReactElement) =>
  function patchedRender(this: unknown, ...args: any[]) {
    const element = originalRender.apply(this, args);
    if (!element || !element.props) return element;

    const flat = (StyleSheet.flatten(element.props.style) ?? {}) as TextStyle;
    if (flat.fontFamily) return element;

    const family = lexendFamilyFor(flat.fontWeight);
    return React.cloneElement(element, {
      style: [element.props.style, { fontFamily: family }],
    });
  };

/**
 * Sets a baseline `fontFamily` on `defaultProps.style` so the most common
 * case (any `<Text>` without an explicit family) still resolves to Lexend
 * even if the render patch below fails to install (defensive coverage).
 */
const applyDefaultPropsBaseline = (Component: AnyComponent) => {
  Component.defaultProps = Component.defaultProps ?? {};
  // Prepend our default; user-provided styles still win because they come
  // after Component's defaultProps.style during merge.
  Component.defaultProps.style = [
    { fontFamily: defaultFontFamily },
    Component.defaultProps.style,
  ];
};

/**
 * Patches RN's `<Text>` and `<TextInput>` so every render injects a Lexend
 * `fontFamily` whenever the resolved style has none. Runs at most once.
 *
 * This is the single source of truth that guarantees Lexend coverage for
 * inline `fontWeight` values throughout the app — without forcing every
 * call site to remember to set `fontFamily` explicitly.
 *
 * Two layers of defense:
 *   1. `Text.defaultProps.style` adds `fontFamily: Lexend_400Regular` so
 *      every <Text> renders Lexend even if the render patch breaks.
 *   2. The render-time patch upgrades to the *correct weight variant*
 *      (Lexend_700Bold, etc.) based on the resolved style's fontWeight.
 */
export const applyLexendDefaults = (): void => {
  // forwardRef component: Text exposes `.render`.
  const TextComp = Text as unknown as AnyComponent & { [PATCHED_FLAG]?: boolean };
  if (!TextComp[PATCHED_FLAG]) {
    try {
      applyDefaultPropsBaseline(TextComp);
      if (typeof TextComp.render === 'function') {
        TextComp.render = wrapRender(TextComp.render);
      }
      TextComp[PATCHED_FLAG] = true;
    } catch (err) {
      console.warn('[NeuroPilot] Failed to patch Text for Lexend:', err);
    }
  }

  // Class component: TextInput renders via `prototype.render`.
  const TextInputComp = TextInput as unknown as AnyComponent & {
    [PATCHED_FLAG]?: boolean;
  };
  if (!TextInputComp[PATCHED_FLAG]) {
    try {
      applyDefaultPropsBaseline(TextInputComp);
      if (TextInputComp.prototype && typeof TextInputComp.prototype.render === 'function') {
        TextInputComp.prototype.render = wrapRender(TextInputComp.prototype.render);
      }
      TextInputComp[PATCHED_FLAG] = true;
    } catch (err) {
      console.warn('[NeuroPilot] Failed to patch TextInput for Lexend:', err);
    }
  }
};
