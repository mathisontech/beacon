import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Light theme colors for right sidebar
const lightTheme = {
  background: '#ffffff',
  backgroundElevated: '#f8f9fa',
  border: '#e5e7eb',
  text: '#1f2937',
  textSecondary: '#6b7280',
};

interface CollapsibleWidgetProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  headerRight?: React.ReactNode;
  minHeight?: number;
  variant?: 'dark' | 'light';
}

export const CollapsibleWidget: React.FC<CollapsibleWidgetProps> = ({
  title,
  children,
  defaultCollapsed = false,
  onToggle,
  headerRight,
  minHeight = 150,
  variant = 'dark',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const animatedHeight = useRef(new Animated.Value(defaultCollapsed ? 0 : 1)).current;

  const isLight = variant === 'light';

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);

    Animated.timing(animatedHeight, {
      toValue: newCollapsed ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={[
      styles.container,
      isLight && { backgroundColor: lightTheme.background, shadowOpacity: 0.05 }
    ]}>
      <TouchableOpacity
        style={[
          styles.header,
          isLight && {
            backgroundColor: lightTheme.backgroundElevated,
            borderBottomColor: lightTheme.border,
          }
        ]}
        onPress={toggleCollapse}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={[
            styles.title,
            isLight && { color: lightTheme.text }
          ]}>{title}</Text>
        </View>
        <View style={styles.headerRight}>
          {headerRight}
          <Text style={[
            styles.collapseIcon,
            isLight && { color: lightTheme.textSecondary }
          ]}>
            {isCollapsed ? '+' : '−'}
          </Text>
        </View>
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={[styles.content, { minHeight }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.cardElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  collapseIcon: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    width: 24,
    textAlign: 'center',
  },
  content: {
    padding: spacing.md,
  },
});

export default CollapsibleWidget;
