import '../global.css'
import { TRPCProvider } from '@/lib/trpc/provider'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const theme = {
  ...MD3LightTheme,
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <TRPCProvider>
          <Slot />
          <StatusBar style="auto" />
        </TRPCProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
