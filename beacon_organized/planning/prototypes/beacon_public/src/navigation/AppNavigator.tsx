import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useAuthStore } from '../store';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Main screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { MapScreen } from '../screens/map/MapScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { FeedScreen } from '../screens/community/FeedScreen';
import { CreatePostScreen } from '../screens/community/CreatePostScreen';
import { MyStatusScreen } from '../screens/status/MyStatusScreen';

// Type definitions
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Alerts: undefined;
  Community: undefined;
  Profile: undefined;
};

export type CommunityStackParamList = {
  Feed: undefined;
  CreatePost: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const CommunityStack = createStackNavigator<CommunityStackParamList>();

// Tab bar icon component
const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return '🏠';
      case 'Map':
        return '🗺️';
      case 'Alerts':
        return '🚨';
      case 'Community':
        return '👥';
      case 'Profile':
        return '👤';
      default:
        return '•';
    }
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{getIcon()}</Text>
    </View>
  );
};

// Auth navigator
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Community stack navigator
const CommunityNavigator: React.FC = () => {
  return (
    <CommunityStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <CommunityStack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <CommunityStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: 'Create Post',
          presentation: 'modal',
        }}
      />
    </CommunityStack.Navigator>
  );
};

// Placeholder Profile screen
const ProfileScreen: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.profileContainer}>
      <Text style={styles.profileTitle}>Profile</Text>
      <Text style={styles.profileSubtitle}>Manage your account</Text>
      {/* TODO: Implement profile screen with:
          - User info display
          - Edit profile
          - Notification settings
          - Emergency contacts
          - Logout button
      */}
    </View>
  );
};

// Main tab navigator
const MainNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#8a8a9a',
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#3a3a4a',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#1a1a2e',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarLabel: 'Map' }}
      />
      <MainTab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
      <MainTab.Screen
        name="Community"
        component={CommunityNavigator}
        options={{ tabBarLabel: 'Community' }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};

// Root navigator
export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
    paddingTop: 60,
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#8a8a9a',
  },
});
