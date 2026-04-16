import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface WeatherCondition {
  temperature: number;
  temperatureUnit: 'F' | 'C';
  condition: string;
  humidity: number;
  windSpeed: number;
  windUnit: string;
  precipitation?: number;
  uvIndex?: number;
}

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  title: string;
  expires: string;
}

interface WeatherWidgetProps {
  location: string;
  current: WeatherCondition;
  alerts?: WeatherAlert[];
  onPress?: () => void;
  onAlertPress?: (alert: WeatherAlert) => void;
}

const getWeatherIcon = (condition: string): string => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return '☀';
  if (lowerCondition.includes('cloud') && lowerCondition.includes('part')) return '⛅';
  if (lowerCondition.includes('cloud')) return '☁';
  if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return '🌧';
  if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return '⛈';
  if (lowerCondition.includes('snow')) return '❄';
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫';
  if (lowerCondition.includes('wind')) return '💨';
  return '🌤';
};

const getAlertColor = (type: WeatherAlert['type']) => {
  switch (type) {
    case 'warning':
      return colors.status.critical;
    case 'watch':
      return colors.status.severe;
    case 'advisory':
      return colors.status.moderate;
  }
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location,
  current,
  alerts = [],
  onPress,
  onAlertPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.mainContent}>
        <View style={styles.leftSection}>
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
          <View style={styles.temperatureRow}>
            <Text style={styles.temperature}>
              {current.temperature}°{current.temperatureUnit}
            </Text>
            <Text style={styles.weatherIcon}>
              {getWeatherIcon(current.condition)}
            </Text>
          </View>
          <Text style={styles.condition}>{current.condition}</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{current.humidity}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>
              {current.windSpeed} {current.windUnit}
            </Text>
          </View>
          {current.precipitation !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Precip</Text>
              <Text style={styles.detailValue}>{current.precipitation}%</Text>
            </View>
          )}
        </View>
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          {alerts.slice(0, 2).map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertBadge,
                { backgroundColor: getAlertColor(alert.type) },
              ]}
              onPress={() => onAlertPress?.(alert)}
            >
              <Text style={styles.alertText} numberOfLines={1}>
                {alert.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  temperature: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  weatherIcon: {
    fontSize: typography.sizes['2xl'],
  },
  condition: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  rightSection: {
    justifyContent: 'center',
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  alertsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: spacing.sm,
  },
  alertBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  alertText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});

export default WeatherWidget;
