import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EventsListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.placeholder}>Events list coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#8b8b9e',
    textAlign: 'center',
  },
});

export default EventsListScreen;
