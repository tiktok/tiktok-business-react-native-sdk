import { ScrollView, StyleSheet } from 'react-native';

import { DebugConsole } from '../components/DebugConsole';
import { debugConsoleColors } from '../styles/debugConsoleStyles';

export function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <DebugConsole />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: debugConsoleColors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
});
