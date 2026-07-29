import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  return (
    <GamificationContext.Provider
      value={{
        ...state,
        setEnergy,
        deductEnergy,
        addExp,
        setGamificationState,
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
