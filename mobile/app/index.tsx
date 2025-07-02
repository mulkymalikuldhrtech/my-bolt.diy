import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, FlatList, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { getAgents } from '@/lib/bolt';
import { Link } from 'expo-router';

export default function AgentsList() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Awaited<ReturnType<typeof getAgents>>>([]);

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={agents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link
          href={{ pathname: '/agent', params: { id: item.id, name: item.name } }}
          asChild
        >
          <Pressable style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc}>{item.description ?? 'No description'}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});