import React from 'react';
import { Text, TextInput } from 'react-native';
import { applyLexendDefaults } from '../applyLexendDefaults';

const resetTextPatch = () => {
  const TextAny = Text as any;
  TextAny.__lexendPatched__ = false;
  delete TextAny.defaultProps;
};

const resetTextInputPatch = () => {
  const InputAny = TextInput as any;
  InputAny.__lexendPatched__ = false;
  delete InputAny.defaultProps;
};

describe('applyLexendDefaults', () => {
  beforeEach(() => {
    resetTextPatch();
    resetTextInputPatch();
  });

  it('patches Text.render so the rendered element gets a Lexend family', () => {
    const TextAny = Text as any;
    const originalStyle = { fontWeight: '700', color: 'red' };
    const fakeOriginalElement = React.createElement('Text', { style: originalStyle });
    TextAny.render = jest.fn().mockReturnValue(fakeOriginalElement);

    applyLexendDefaults();

    const result = (Text as any).render({});
    expect(result.props.style).toEqual([originalStyle, { fontFamily: 'Lexend_700Bold' }]);
  });

  it('does not override an explicit fontFamily already set on the element', () => {
    const TextAny = Text as any;
    const explicitStyle = { fontFamily: 'CustomFont', fontWeight: '700' };
    TextAny.render = jest.fn().mockReturnValue(
      React.createElement('Text', { style: explicitStyle })
    );

    applyLexendDefaults();
    const result = (Text as any).render({});
    expect(result.props.style).toEqual(explicitStyle);
  });

  it('also patches TextInput.prototype.render', () => {
    const InputAny = TextInput as any;
    const inputStyle = { fontWeight: '500' };
    InputAny.prototype.render = jest.fn().mockReturnValue(
      React.createElement('TextInput', { style: inputStyle })
    );

    applyLexendDefaults();

    const result = (TextInput as any).prototype.render.call({});
    expect(result.props.style).toEqual([inputStyle, { fontFamily: 'Lexend_500Medium' }]);
  });

  it('is idempotent — running it twice still yields a single layer of patching', () => {
    const TextAny = Text as any;
    let invocations = 0;
    TextAny.render = () => {
      invocations += 1;
      return React.createElement('Text', { style: { fontWeight: '600' } });
    };

    applyLexendDefaults();
    applyLexendDefaults();

    (Text as any).render({});
    expect(invocations).toBe(1);
  });

  it('sets a Lexend Regular baseline on Text.defaultProps.style as a safety net', () => {
    applyLexendDefaults();
    const flat = (Text as any).defaultProps.style;
    expect(Array.isArray(flat)).toBe(true);
    expect(flat[0]).toEqual({ fontFamily: 'Lexend_400Regular' });
  });

  it('sets the same baseline on TextInput.defaultProps.style', () => {
    applyLexendDefaults();
    const flat = (TextInput as any).defaultProps.style;
    expect(Array.isArray(flat)).toBe(true);
    expect(flat[0]).toEqual({ fontFamily: 'Lexend_400Regular' });
  });

  it('survives if Text.render is missing (e.g., custom RN fork)', () => {
    const TextAny = Text as any;
    delete TextAny.render;
    expect(() => applyLexendDefaults()).not.toThrow();
    // Baseline still applied even though render couldn't be wrapped.
    expect((Text as any).defaultProps.style[0]).toEqual({ fontFamily: 'Lexend_400Regular' });
  });
});
