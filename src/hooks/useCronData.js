import { useEffect, useState, useMemo, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { CronDataFetcher } from "../logic";
import { PerformanceDebugger } from "../debug/debugUtils";

export default function useCronData(address, isConnected) {
  const publicClient = usePublicClient();
  const [crons, setCrons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balances, setBalances] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoize data fetcher to prevent recreation on every render
  const dataFetcher = useMemo(() => {
    return publicClient ? new CronDataFetcher(publicClient) : null;
  }, [publicClient]);

  // Function to trigger data refresh
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Fetch crons list using separated logic
  useEffect(() => {
    let ignore = false;
    let timeoutId = null;
    
    async function fetchCrons() {
      if (!isConnected || !address || !dataFetcher) {
        setCrons([]);
        setLoading(false);
        setError("");
        return;
      }
      
      // Add debounce to prevent rapid successive calls
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(async () => {
        if (ignore) return;
        
        setLoading(true);
        setError("");
        
        PerformanceDebugger.startTimer('fetchCrons');
        
        try {
          const allCrons = await dataFetcher.fetchCronJobs(address);
          if (!ignore) {
            setCrons(allCrons || []);
            console.log(`📊 Fetched ${allCrons?.length || 0} cron jobs for ${address}`);
          }
        } catch (e) {
          if (!ignore) {
            const errorMsg = "Failed to fetch your crons: " + String(e?.message || e);
            setError(errorMsg);
            setCrons([]);
            console.error('❌ Fetch crons error:', e);
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
          PerformanceDebugger.endTimer('fetchCrons');
        }
      }, 300); // 300ms debounce
    }

    fetchCrons();
    return () => { 
      ignore = true; 
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isConnected, address, dataFetcher, refreshTrigger]);

  // Fetch cron details for each cron using separated logic
  useEffect(() => {
    if (!dataFetcher || !crons.length) return;
    
    let ignore = false;
    
    async function fetchCronDetails() {
      PerformanceDebugger.startTimer('fetchCronDetails');
      
      const cronDetailsMap = {};
      
      // Process crons in batches to avoid overwhelming RPC
      for (let i = 0; i < crons.length; i++) {
        if (ignore) break;
        
        const cron = crons[i];
        try {
          const cronDetail = await dataFetcher.fetchCronDetails(cron.id);
          if (cronDetail && !ignore) {
            cronDetailsMap[cron.id] = cronDetail;
          }
        } catch (e) {
          console.error(`Error fetching details for cron ${cron.id}:`, e);
        }
        
        // Add small delay between requests to prevent spam
        if (i < crons.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Update crons with details only if we have new data
      if (!ignore && Object.keys(cronDetailsMap).length > 0) {
        setCrons(currentCrons => 
          currentCrons.map(cron => ({
            ...cron,
            details: cronDetailsMap[cron.id] || cron.details || null
          }))
        );
      }
      
      PerformanceDebugger.endTimer('fetchCronDetails');
    }
    
    fetchCronDetails();
    return () => { ignore = true; };
  }, [dataFetcher, crons.length]); // Only depend on length, not the array itself

  // Fetch ETH balance for each alias wallet using separated logic
  useEffect(() => {
    if (!dataFetcher || !crons.length) return;
    
    let ignore = false;
    
    async function fetchBalances() {
      PerformanceDebugger.startTimer('fetchBalances');
      
      try {
        const addresses = crons.map(cron => cron.address).filter(Boolean);
        if (addresses.length === 0) return;
        
        const balanceData = await dataFetcher.fetchBalances(addresses);
        if (!ignore) {
          setBalances(balanceData || {});
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
        if (!ignore) {
          setBalances({});
        }
      } finally {
        PerformanceDebugger.endTimer('fetchBalances');
      }
    }

    fetchBalances();
    return () => { ignore = true; };
  }, [dataFetcher, crons.length]); // Only depend on length, not the array itself

  return { crons, loading, error, balances, refreshData };
}