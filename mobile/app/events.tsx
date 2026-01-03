import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from '@/components/Layout';

export default function EventsScreen() {
  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.text}>
          Discover upcoming campus events and activities.
        </Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
});
