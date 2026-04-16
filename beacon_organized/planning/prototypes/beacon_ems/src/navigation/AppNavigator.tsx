import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { useAuthStore } from '../store';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import { MapsScreen } from '../screens/maps/MapsScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { IncidentsScreen } from '../screens/incidents/IncidentsScreen';
import { IncidentDetailScreen } from '../screens/incidents/IncidentDetailScreen';
import { MyTeamScreen } from '../screens/team/MyTeamScreen';
import { PartnerAgenciesScreen } from '../screens/partners/PartnerAgenciesScreen';
import { DispatchManagerScreen } from '../screens/dispatch/DispatchManagerScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { MissingPersonsScreen } from '../screens/missing/MissingPersonsScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;
const SIDEBAR_WIDTH = 250;

// Beacon Colors
const colors = {
  primary: '#0097b2',
  primaryDark: '#007a94',
  primaryLight: '#00a8c7',
  background: '#0097b2',
  backgroundGradientStart: '#007a94',
  backgroundGradientEnd: '#00a8c7',
  card: 'rgba(255, 255, 255, 0.15)',
  cardHover: 'rgba(255, 255, 255, 0.25)',
  cardSolid: '#ffffff',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.3)',
  borderLight: 'rgba(255, 255, 255, 0.2)',
  notificationBadge: '#ff4444',
};

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Maps: undefined;
  Events: undefined;
  IncidentsTab: undefined;
  MyTeam: undefined;
  MissingPersons: undefined;
  Partners: undefined;
  Dispatch: undefined;
  Messages: undefined;
  Notifications: undefined;
};

export type IncidentsStackParamList = {
  IncidentsList: undefined;
  IncidentDetail: { incidentId: string };
};

// Stack navigators
const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const IncidentsStack = createStackNavigator<IncidentsStackParamList>();

// Incidents Stack Navigator
const IncidentsNavigator: React.FC = () => {
  return (
    <IncidentsStack.Navigator screenOptions={{ headerShown: false }}>
      <IncidentsStack.Screen name="IncidentsList" component={IncidentsScreen} />
      <IncidentsStack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
    </IncidentsStack.Navigator>
  );
};

// Tab configuration - main nav items (text only, no icons)
const mainNavConfig = [
  { name: 'Dashboard', label: 'Dashboard' },
  { name: 'Calendar', label: 'Calendar' },
  { name: 'Maps', label: 'Maps' },
  { name: 'Events', label: 'Regional Events' },
  { name: 'IncidentsTab', label: 'Incidents' },
  { name: 'MyTeam', label: 'My Team' },
  { name: 'MissingPersons', label: 'Missing Persons' },
  { name: 'Partners', label: 'Partners' },
  { name: 'Dispatch', label: 'Dispatch Manager' },
] as const;

// Icon-only nav items (Messages and Notifications)
const iconNavConfig = [
  { name: 'Messages', icon: '💬', badge: 3 },
  { name: 'Notifications', icon: '🔔', badge: 5 },
] as const;

// Desktop Sidebar Component
interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const DesktopSidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  const logout = useAuthStore((state) => state.logout);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <View style={styles.sidebar}>
      {/* Logo */}
      <View style={styles.sidebarHeader}>
        <View>
          <Text style={styles.sidebarLogo}>BEACON</Text>
          <Text style={styles.sidebarLogoSub}>EMS</Text>
        </View>
      </View>

      {/* Main Navigation */}
      <ScrollView style={styles.sidebarNav} showsVerticalScrollIndicator={false}>
        {mainNavConfig.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.sidebarNavItem,
              currentRoute === item.name && styles.sidebarNavItemActive,
            ]}
            onPress={() => onNavigate(item.name)}
          >
            <Text
              style={[
                styles.sidebarNavText,
                currentRoute === item.name && styles.sidebarNavTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User Section */}
      <View style={styles.sidebarFooter}>
        {/* Icon nav items */}
        <View style={styles.iconNavRow}>
          {iconNavConfig.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.iconNavButton,
                currentRoute === item.name && styles.iconNavButtonActive,
              ]}
              onPress={() => onNavigate(item.name)}
            >
              <Text style={styles.iconNavIcon}>{item.icon}</Text>
              {item.badge > 0 && (
                <View style={styles.iconNavBadge}>
                  <Text style={styles.iconNavBadgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* User profile */}
        <TouchableOpacity
          style={styles.userProfile}
          onPress={() => setUserMenuOpen(!userMenuOpen)}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>JD</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userRole}>Fire Chief</Text>
          </View>
          <Text style={styles.userMenuIcon}>{userMenuOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* User dropdown menu */}
        {userMenuOpen && (
          <View style={styles.userMenu}>
            <TouchableOpacity style={styles.userMenuItem}>
              <Text style={styles.userMenuItemText}>Profile Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userMenuItem}>
              <Text style={styles.userMenuItemText}>Preferences</Text>
            </TouchableOpacity>
            <View style={styles.userMenuDivider} />
            <TouchableOpacity style={styles.userMenuItem} onPress={logout}>
              <Text style={[styles.userMenuItemText, styles.userMenuItemTextDanger]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// Mobile Hamburger Menu
interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
}) => {
  const logout = useAuthStore((state) => state.logout);

  const handleNavigate = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.menuOverlay} onPress={onClose} activeOpacity={1}>
        <SafeAreaView style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View>
              <Text style={styles.menuLogo}>BEACON</Text>
              <Text style={styles.menuLogoSub}>EMS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuItems}>
            {mainNavConfig.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  currentRoute === item.name && styles.menuItemActive,
                ]}
                onPress={() => handleNavigate(item.name)}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    currentRoute === item.name && styles.menuItemTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.menuDivider} />

            {/* Messages and Notifications */}
            {iconNavConfig.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  currentRoute === item.name && styles.menuItemActive,
                ]}
                onPress={() => handleNavigate(item.name)}
              >
                <View style={styles.menuItemIconContainer}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  {item.badge > 0 && (
                    <View style={styles.menuItemBadge}>
                      <Text style={styles.menuItemBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.menuItemText,
                    currentRoute === item.name && styles.menuItemTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.menuFooter}>
            {/* User info */}
            <View style={styles.menuUserInfo}>
              <View style={styles.menuUserAvatar}>
                <Text style={styles.menuUserAvatarText}>JD</Text>
              </View>
              <View>
                <Text style={styles.menuUserName}>John Doe</Text>
                <Text style={styles.menuUserRole}>Fire Chief</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

// Mobile Header
interface MobileHeaderProps {
  title: string;
  navigation: any;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, navigation }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentRoute = navigation.getState()?.routes[navigation.getState()?.index]?.name || 'Dashboard';

  // Get friendly title for display
  const getDisplayTitle = (route: string) => {
    const config = mainNavConfig.find(c => c.name === route);
    if (config) return config.label;
    if (route === 'Messages') return 'Messages';
    if (route === 'Notifications') return 'Notifications';
    return route;
  };

  return (
    <>
      <View style={styles.mobileHeader}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setMenuOpen(true)}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.mobileTitle}>{getDisplayTitle(currentRoute)}</Text>
        <View style={styles.mobileHeaderRight}>
          {/* Messages and Notifications icons */}
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <Text style={styles.headerIcon}>💬</Text>
            <View style={styles.headerIconBadge}>
              <Text style={styles.headerIconBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.headerIcon}>🔔</Text>
            <View style={styles.headerIconBadge}>
              <Text style={styles.headerIconBadgeText}>5</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.userButtonMobile}>
            <Text style={styles.userButtonTextMobile}>JD</Text>
          </TouchableOpacity>
        </View>
      </View>
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentRoute={currentRoute}
        onNavigate={(route) => navigation.navigate(route)}
      />
    </>
  );
};

// Desktop Layout Wrapper
interface DesktopLayoutProps {
  children: React.ReactNode;
  navigation: any;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, navigation }) => {
  const currentRoute = navigation.getState()?.routes[navigation.getState()?.index]?.name || 'Dashboard';

  return (
    <View style={styles.desktopLayout}>
      <DesktopSidebar
        currentRoute={currentRoute}
        onNavigate={(route) => navigation.navigate(route)}
      />
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
};

// Main Tab Navigator
const MainNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ navigation, route }) => ({
        header: () => IS_MOBILE ? (
          <MobileHeader title={route.name} navigation={navigation} />
        ) : null,
        tabBarStyle: IS_MOBILE ? styles.mobileTabBar : { display: 'none' },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowIcon: false,
      })}
    >
      <MainTab.Screen
        name="Dashboard"
        options={{ tabBarLabel: 'Home' }}
      >
        {(props) => IS_MOBILE ? (
          <DashboardScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <DashboardScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="Calendar"
        options={{ tabBarLabel: 'Calendar' }}
      >
        {(props) => IS_MOBILE ? (
          <CalendarScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <CalendarScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="Maps"
        options={{ tabBarLabel: 'Maps' }}
      >
        {(props) => IS_MOBILE ? (
          <MapsScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <MapsScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="Events"
        options={{ tabBarLabel: 'Events' }}
      >
        {(props) => IS_MOBILE ? (
          <EventsScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <EventsScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="IncidentsTab"
        options={{ tabBarLabel: 'Incidents' }}
      >
        {(props) => IS_MOBILE ? (
          <IncidentsNavigator />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <IncidentsNavigator />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="MyTeam"
        options={{ tabBarLabel: 'Team' }}
      >
        {(props) => IS_MOBILE ? (
          <MyTeamScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <MyTeamScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="MissingPersons"
        options={{ tabBarLabel: 'Missing' }}
      >
        {(props) => IS_MOBILE ? (
          <MissingPersonsScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <MissingPersonsScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="Partners"
        options={{ tabBarLabel: 'Partners' }}
      >
        {(props) => IS_MOBILE ? (
          <PartnerAgenciesScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <PartnerAgenciesScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="Dispatch"
        options={{ tabBarLabel: 'Dispatch' }}
      >
        {(props) => IS_MOBILE ? (
          <DispatchManagerScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <DispatchManagerScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="Messages"
        options={{
          tabBarButton: () => null, // Hide from bottom tab bar
        }}
      >
        {(props) => IS_MOBILE ? (
          <MessagesScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <MessagesScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
      <MainTab.Screen
        name="Notifications"
        options={{
          tabBarButton: () => null, // Hide from bottom tab bar
        }}
      >
        {(props) => IS_MOBILE ? (
          <NotificationsScreen />
        ) : (
          <DesktopLayout navigation={props.navigation}>
            <NotificationsScreen />
          </DesktopLayout>
        )}
      </MainTab.Screen>
    </MainTab.Navigator>
  );
};

// Auth Navigator
const AuthNavigator: React.FC = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="Auth" component={LoginScreen} />
  </RootStack.Navigator>
);

// Root Navigator
export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // Desktop Layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },

  // Desktop Sidebar
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sidebarLogo: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  sidebarLogoSub: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  sidebarNav: {
    flex: 1,
    paddingTop: 12,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 8,
  },
  sidebarNavItemActive: {
    backgroundColor: colors.cardHover,
  },
  sidebarNavText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  sidebarNavTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: 16,
  },
  iconNavRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  iconNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconNavButtonActive: {
    backgroundColor: colors.cardHover,
  },
  iconNavIcon: {
    fontSize: 20,
  },
  iconNavBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.notificationBadge,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  iconNavBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  userRole: {
    fontSize: 11,
    color: colors.textMuted,
  },
  userMenuIcon: {
    fontSize: 10,
    color: colors.textMuted,
  },
  userMenu: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: colors.cardHover,
    borderRadius: 8,
    overflow: 'hidden',
  },
  userMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userMenuItemText: {
    fontSize: 13,
    color: colors.text,
  },
  userMenuItemTextDanger: {
    color: '#ff6b6b',
  },
  userMenuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Mobile Header
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 1,
  },
  mobileTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerIcon: {
    fontSize: 18,
  },
  headerIconBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.notificationBadge,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  headerIconBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text,
  },
  userButtonMobile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userButtonTextMobile: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },

  // Mobile Tab Bar
  mobileTabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 65,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Hamburger Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: 300,
    height: '100%',
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLogo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  menuLogoSub: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    color: colors.text,
  },
  menuItems: {
    flex: 1,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  menuItemActive: {
    backgroundColor: colors.card,
  },
  menuItemIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemBadge: {
    position: 'absolute',
    top: -6,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.notificationBadge,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  menuItemBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  menuItemText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
    marginHorizontal: 24,
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuUserAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuUserRole: {
    fontSize: 12,
    color: colors.textMuted,
  },
  logoutButton: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AppNavigator;
