import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { delegate } from '@/lib/bolt';

export default function AgentDetail() {
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const { id, name } = params;

  const [taskType, setTaskType] = useState('ping');
  const [payload, setPayload] = useState('{}');
  const [response, setResponse] = useState<unknown>(null);

  const sendTask = async () => {
    try {
      const parsed = payload ? JSON.parse(payload) : undefined;
      const res = await delegate(id!, taskType, parsed);
      setResponse(res);
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.label}>Task Type</Text>
      <TextInput style={styles.input} value={taskType} onChangeText={setTaskType} />
      <Text style={styles.label}>Payload (JSON)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        numberOfLines={4}
        value={payload}
        onChangeText={setPayload}
      />
      <Pressable style={styles.button} onPress={sendTask}>
        <Text style={styles.buttonText}>Send</Text>
      </Pressable>

      {response && (
        <View style={styles.responseBox}>
          <Text selectable>{JSON.stringify(response, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  button: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  responseBox: {
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
  },
});