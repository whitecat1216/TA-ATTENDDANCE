import { useNavigation } from '@react-navigation/native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { Card } from '../components/Card'

export function MenuScreen() {
  const navigation = useNavigation()
  const { user } = useAuth()

  const items = [
    { title: 'シフト', description: '今月のシフト一覧を確認', route: 'Shift' },
    { title: '勤怠集計', description: '月次の勤怠集計を確認', route: 'Summary' },
    { title: 'CSV 出力', description: 'CSV を生成して共有', route: 'Reports' },
  ]

  if (user?.role === 'admin' || user?.role === 'manager') {
    items.push({
      title: '従業員管理',
      description: '従業員一覧を確認',
      route: 'Employees',
    })
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>その他メニュー</Text>
          <Text style={styles.subtitle}>主要画面へ移動できます</Text>
        </View>

        {items.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => navigation.navigate(item.route as never)}
          >
            <Card>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemDescription: {
    fontSize: 14,
    color: '#64748b',
  },
})
