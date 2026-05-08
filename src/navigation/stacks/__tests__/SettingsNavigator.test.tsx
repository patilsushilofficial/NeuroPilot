import React from 'react';
import { render } from '@testing-library/react-native';
import { SettingsNavigator } from '../SettingsNavigator';
import { NavigationContainer } from '@react-navigation/native';

// Mock screens to avoid complex rendering
jest.mock('../../../screens/settings/SettingsScreen', () => ({
  SettingsScreen: () => <mock-settings-screen />,
}));

jest.mock('../../../screens/settings/EditProfileScreen', () => ({
  EditProfileScreen: () => <mock-edit-profile-screen />,
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
