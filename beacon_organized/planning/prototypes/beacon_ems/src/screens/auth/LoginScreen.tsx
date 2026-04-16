import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 768;

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<TextInput>(null);

  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    // For development: directly set authenticated state
    setLoading(true);
    const authStore = useAuthStore.getState();
    // Simulate setting a mock user
    useAuthStore.setState({
      user: {
        id: 'dev-user',
        email: 'dev@beacon.ems',
        name: 'Dev User',
        role: 'admin',
      },
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const clearError = () => {
    if (error) setError('');
  };

  return (
    <LinearGradient
      colors={['#007a94', '#0097b2', '#00a8c7']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Logo in top left */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoBeacon}>BEACON</Text>
        <Text style={styles.logoSub}>EMS</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Welcome back!</Text>
              <View style={styles.headerDivider} />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              {/* Username Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={usernameRef}
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor="#9ca3af"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      clearError();
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      clearError();
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.passwordToggleIcon}>
                      {showPassword ? '◉' : '○'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <TouchableOpacity
                onPress={handleDevBypass}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.devBypassText}>
                  Dev Bypass (Remove before production)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 20,
  },
  logoBeacon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 120,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: isSmallScreen ? 40 : 80,
    paddingHorizontal: isSmallScreen ? 24 : 60,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#626769',
    textAlign: 'center',
    marginBottom: 30,
  },
  headerDivider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'center',
    maxWidth: 460,
    width: '100%',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginTop: 40,
  },
  formGroup: {
    marginBottom: 30,
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#626769',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 50,
    backgroundColor: '#f1f6f6',
    color: '#333',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
  },
  passwordToggleIcon: {
    fontSize: 18,
    color: '#666',
  },
  submitButton: {
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: '#e0e1e8',
    marginTop: 40,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#080f2a',
    textAlign: 'center',
  },
  footer: {
    marginTop: 50,
    alignItems: 'center',
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginBottom: 20,
  },
  devBypassText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#626769',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
