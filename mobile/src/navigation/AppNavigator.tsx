import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { DashboardScreen } from '../screens/DashboardScreen'
import { EmployeesScreen } from '../screens/EmployeesScreen'
import { LeaveScreen } from '../screens/LeaveScreen'
import { LoginScreen } from '../screens/LoginScreen'
import { MenuScreen } from '../screens/MenuScreen'
import { ReportsScreen } from '../screens/ReportsScreen'
import { ShiftScreen } from '../screens/ShiftScreen'
import { SummaryScreen } from '../screens/SummaryScreen'
import { TimeTrackingScreen } from '../screens/TimeTrackingScreen'

type RootStackParamList = {
  MainTabs: undefined
  Shift: undefined
  Summary: undefined
  Reports: undefined
  Employees: undefined
}

type MainTabsParamList = {
  Dashboard: undefined
  TimeTracking: undefined
  Leave: undefined
  Menu: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabsParamList>()

const icons: Record<keyof MainTabsParamList, string> = {
  Dashboard: '🏠',
  TimeTracking: '⏰',
  Leave: '🌴',
  Menu: '☰',
}

function MainTabs() {
  const { logout } = useAuth()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name !== 'Menu',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: styles.tabBar,
        headerRight: () => (
          <Pressable onPress={logout} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>ログアウト</Text>
          </Pressable>
        ),
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>{icons[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'ダッシュボード' }}
      />
      <Tab.Screen
        name="TimeTracking"
        component={TimeTrackingScreen}
        options={{ title: '打刻' }}
      />
      <Tab.Screen
        name="Leave"
        component={LeaveScreen}
        options={{ title: '休暇' }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: 'その他', headerShown: false }}
      />
    </Tab.Navigator>
  )
}

export function AppNavigator() {
  const { user } = useAuth()

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Shift" component={ShiftScreen} options={{ title: 'シフト' }} />
          <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: '勤怠集計' }} />
          <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'CSV 出力' }} />
          <Stack.Screen name="Employees" component={EmployeesScreen} options={{ title: '従業員管理' }} />
        </Stack.Navigator>
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: 16,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
})
