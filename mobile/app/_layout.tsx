import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Agents' }} />
        <Stack.Screen name="agent" options={{ title: 'Agent Details' }} />
      </Stack>
    </SafeAreaProvider>
  );
}