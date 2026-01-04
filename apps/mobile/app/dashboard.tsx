import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { Button } from 'react-native-paper'

export default function DashboardScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Dashboard</Text>
      <Text className="text-gray-500 text-center mb-8">Welcome to your dashboard</Text>
      <Link href="/" asChild>
        <Button mode="outlined">Back to Home</Button>
      </Link>
    </View>
  )
}
