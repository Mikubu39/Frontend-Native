import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading indicator screen
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
