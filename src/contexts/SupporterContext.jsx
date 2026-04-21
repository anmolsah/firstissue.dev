import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  const [isSupporter, setIsSupporter] = useState(false);
  const [supporterData, setSupporterData] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSupporterStatus = useCallback(async () => {
    if (!user?.id) {
      setIsSupporter(false);
      setSupporterData(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('supporters')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (not an error for us)
        console.error('Error checking supporter status:', error);
      }

      if (data) {
        // Check if subscription has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setIsSupporter(false);
          setSupporterData({ ...data, status: 'expired' });
        } else {
          setIsSupporter(true);
          setSupporterData(data);
        }
      } else {
        setIsSupporter(false);
        setSupporterData(null);
      }
    } catch (error) {
      console.error('Error in checkSupporterStatus:', error);
      setIsSupporter(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check on mount and user change
  useEffect(() => {
    checkSupporterStatus();
  }, [checkSupporterStatus]);

  // Listen for real-time updates to supporter status
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('supporter-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supporters',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkSupporterStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, checkSupporterStatus]);

  const value = {
    isSupporter,
    supporterData,
    loading,
    refreshStatus: checkSupporterStatus,
  };

  return (
    <SupporterContext.Provider value={value}>
      {children}
    </SupporterContext.Provider>
  );
};
