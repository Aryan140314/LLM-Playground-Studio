'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SimulationContextType {
  simulateApi: boolean;
  setSimulateApi: (val: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simulateApi, setSimulateApi] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('simulate_api');
    if (saved) {
      setSimulateApi(saved === 'true');
    }
  }, []);

  const handleSetSimulate = (val: boolean) => {
    setSimulateApi(val);
    localStorage.setItem('simulate_api', String(val));
  };

  return (
    <SimulationContext.Provider value={{ simulateApi, setSimulateApi: handleSetSimulate }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
