import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useDebugScreen } from '../../hooks/useDebugScreen';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';

export const DebugScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    testImmediateNotification,
    testScheduledNotification,
    testHaptic,
    grantTestXP,
    debugXpGrant,
    scheduledTestDelaySeconds,
  } = useDebugScreen();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[theme.text.h2, styles.title]}>🛠️ Debug Menu</Text>

        <Card style={styles.section}>
          <Text style={[theme.text.h4, styles.sectionTitle]}>Notifications</Text>
          <View style={styles.buttonRow}>
            <Button
              label="Immediate Notif"
              onPress={testImmediateNotification}
              variant="primary"
              style={styles.button}
            />
            <Button
              label={`In ${scheduledTestDelaySeconds} Seconds`}
              onPress={testScheduledNotification}
              variant="outline"
              style={styles.button}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[theme.text.h4, styles.sectionTitle]}>Haptics (Vibration)</Text>
          <View style={styles.buttonRow}>
            <Button label="Success" onPress={() => testHaptic('success')} variant="outline" style={styles.button} />
            <Button label="Warning" onPress={() => testHaptic('warning')} variant="outline" style={styles.button} />
          </View>
          <View style={[styles.buttonRow, styles.buttonRowSpaced]}>
            <Button label="Error" onPress={() => testHaptic('error')} variant="outline" style={styles.button} />
            <Button label="Heavy" onPress={() => testHaptic('heavy')} variant="outline" style={styles.button} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[theme.text.h4, styles.sectionTitle]}>Gamification</Text>
          <Button
            label={`Give me ${debugXpGrant} XP ⚡`}
            onPress={grantTestXP}
            variant="primary"
            fullWidth
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: spacing.md,
      gap: spacing.md,
    },
    title: {
      color: theme.colors.textPrimary,
      marginBottom: spacing.md,
    },
    section: { padding: spacing.md },
    sectionTitle: {
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    buttonRowSpaced: {
      marginTop: spacing.xs,
    },
    button: { flex: 1 },
  });
