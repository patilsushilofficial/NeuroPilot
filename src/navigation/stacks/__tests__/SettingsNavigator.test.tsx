import React from 'react';
import { render } from '@testing-library/react-native';
import { SettingsNavigator } from '../SettingsNavigator';
import { NavigationContainer } from '@react-navigation/native';

import { View } from 'react-native';

// Mock screens to avoid complex rendering
jest.mock('../../../screens/settings/SettingsScreen', () => ({
  SettingsScreen: () => <View />,
}));

jest.mock('../../../screens/settings/EditProfileScreen', () => ({
  EditProfileScreen: () => <View />,
}));

describe('SettingsNavigator', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <SettingsNavigator />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });
});
