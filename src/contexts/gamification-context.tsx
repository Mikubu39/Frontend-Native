import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { energyApi } from '@/services/api/energy';
import { streakApi } from '@/services/api/streak';
import { useAuth } from '@/contexts/auth-context';

interface GamificationState {
  energy: number;
  maxEnergy: number;
  exp: number;
  streak: number;
  coins: number;
}

interface GamificationContextType extends GamificationState {
  setEnergy: (energy: number) => void;
  deductEnergy: (amount: number) => void;
  addExp: (amount: number) => void;
  setGamificationState: (state: Partial<GamificationState>) => void;
  fetchGamificationData: () => Promise<void>;
  refillEnergy: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  // Temporary initial states until backend provides them globally
  const [state, setState] = useState<GamificationState>({
    energy: 25,
    maxEnergy: 25,
    exp: 0,
    streak: 0,
    coins: 0,
  });

  const setEnergy = (energy: number) => {
    setState((prev) => ({ ...prev, energy }));
  };

  const deductEnergy = (amount: number) => {
    setState((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount),
    }));
  };

  const addExp = (amount: number) => {
    setState((prev) => ({
      ...prev,
      exp: prev.exp + amount,
    }));
  };

  const setGamificationState = (newState: Partial<GamificationState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const fetchGamificationData = useCallback(async () => {
    try {
      const [energyRes, streakRes] = await Promise.all([
        energyApi.getEnergy(),
        streakApi.getStreak(),
      ]);
      setState((prev) => ({
        ...prev,
        energy: energyRes.currentEnergy,
        maxEnergy: energyRes.maxEnergy,
        streak: streakRes.currentStreak,
      }));
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    }
  }, []);

  const refillEnergy = useCallback(async () => {
    try {
      const res = await energyApi.refill();
      setState((prev) => ({
        ...prev,
        energy: res.currentEnergy,
        maxEnergy: res.maxEnergy,
      }));
    } catch (error) {
      console.error('Failed to refill energy:', error);
    }
  }, []);

  const { isAuthenticated } = useAuth();

  // Fetch initial data on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGamificationData();
    }
  }, [fetchGamificationData, isAuthenticated]);

  return (
    <GamificationContext.Provider
      value={{
        ...state,
        setEnergy,
        deductEnergy,
        addExp,
        setGamificationState,
        fetchGamificationData,
        refillEnergy,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
