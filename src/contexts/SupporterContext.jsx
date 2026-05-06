import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useSupporterStatus } from '../hooks/queries/useSupporterStatus';

const SupporterContext = createContext({});

export const useSupporter = () => {
  const context = useContext(SupporterContext);
  if (!context) {
    throw new Error('useSupporter must be used within SupporterProvider');
  }
  return context;
};

export const SupporterProvider = ({ children }) => {
  const { user } = useAuth();

  const { isSupporter, supporterData, loading, refreshStatus } =
    useSupporterStatus(user?.id);

  const value = {
    isSupporter,
    supporterData,
    loading,
    refreshStatus,
  };

  return (
    <SupporterContext.Provider value={value}>
      {children}
    </SupporterContext.Provider>
  );
};
