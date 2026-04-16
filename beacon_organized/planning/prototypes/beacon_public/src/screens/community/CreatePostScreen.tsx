import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CreatePostScreenProps {
  navigation: any;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Post</Text>
        <Text style={styles.subtitle}>Share with your community</Text>
        {/* TODO: Implement create post form with:
            - Post type selector (Story / Report)
            - Text input area
            - Image picker / camera
            - Location toggle
            - Submit button
            - Draft saving
        */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8a8a9a',
  },
});
