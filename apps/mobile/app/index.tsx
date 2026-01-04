import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { Button } from 'react-native-paper'

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-3xl font-bold text-gray-900 mb-4">Universal App</Text>
      <Text className="text-gray-500 text-center mb-8">
        A cross-platform full-stack application built with Next.js + React Native
      </Text>
      <View className="flex-row gap-4">
        <Link href="/dashboard" asChild>
          <Button mode="contained">Get Started</Button>
        </Link>
      </View>
    </View>
  )
}
