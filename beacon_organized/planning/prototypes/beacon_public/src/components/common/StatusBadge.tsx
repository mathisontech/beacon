import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type StatusType = 'safe' | 'need_help' | 'evacuating' | 'unknown' | 'info' | 'warning' | 'critical';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'medium',
  style,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return { color: '#28a745', text: label || 'Safe' };
      case 'need_help':
        return { color: '#dc3545', text: label || 'Need Help' };
      case 'evacuating':
        return { color: '#fd7e14', text: label || 'Evacuating' };
      case 'info':
        return { color: '#17a2b8', text: label || 'Info' };
      case 'warning':
        return { color: '#ffc107', text: label || 'Warning' };
      case 'critical':
        return { color: '#dc3545', text: label || 'Critical' };
      case 'unknown':
      default:
        return { color: '#6c757d', text: label || 'Unknown' };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 2,
          paddingHorizontal: 8,
          fontSize: 10,
          borderRadius: 4,
        };
      case 'large':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 16,
          borderRadius: 8,
        };
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 12,
          fontSize: 12,
          borderRadius: 6,
        };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSizeConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${config.color}20`,
          borderColor: config.color,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
