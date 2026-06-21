import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.cream },
        animation: 'slide_from_right',
      }}
    />
  );
}
