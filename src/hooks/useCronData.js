import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";

export default function useCronData(address, isConnected) {
  const publicClient = usePublicClient();
  const [crons, setCrons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balances, setBalances] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger data refresh
  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  // Fetch crons list
  useEffect(() => {
    let ignore = false;
    async function fetchCrons() {
      if (!isConnected || !address || !publicClient) return;
      setLoading(true);
      setError("");
      try {
        let page = 1, pageSize = 25, hasMore = true, allCrons = [];
        while (hasMore && page <= 10) {
          const resp = await publicClient.request({
            method: "eth_getAccountCronsByPageAndSize",
            params: [
              address,
              "0x" + page.toString(16),
              "0x" + pageSize.toString(16)
            ],
          });
          if (Array.isArray(resp)) {
            allCrons = allCrons.concat(resp);
            hasMore = resp.length === pageSize;
            page++;
          } else {
            hasMore = false;
          }
        }
        if (!ignore) setCrons(allCrons);
      } catch (e) {
        setError("Failed to fetch your crons: " + String(e?.message || e));
      }
      setLoading(false);
    }
    fetchCrons();
    return () => { ignore = true; };
  }, [isConnected, address, publicClient, refreshTrigger]);

  // Fetch cron details for each cron
  useEffect(() => {
    if (!publicClient || !crons.length) return;
    let ignore = false;
    
    async function fetchCronDetails() {
      let cronDetailsMap = {};
      
      for (const cron of crons) {
        try {
          // Fetch cron details using eth_getCron
          const cronDetail = await publicClient.request({
            method: "eth_getCron",
            params: [cron.id],
          });
          
          if (cronDetail) {
            cronDetailsMap[cron.id] = cronDetail;
          }
        } catch (e) {
          console.error(`Error fetching details for cron ${cron.id}:`, e);
        }
      }
      
      // Update crons with details
      if (!ignore) {
        setCrons(currentCrons => 
          currentCrons.map(cron => ({
            ...cron,
            details: cronDetailsMap[cron.id] || null
          }))
        );
      }
    }
    
    fetchCronDetails();
    return () => { ignore = true; };
  }, [publicClient, crons.length]);

  // Fetch ETH balance for each alias wallet
  useEffect(() => {
    if (!publicClient || !crons.length) return;
    let ignore = false;
    async function fetchBalances() {
      let balObj = {};
      for (const cron of crons) {
        try {
          const balRaw = await publicClient.getBalance({ address: cron.address });
          balObj[cron.address] = Number(formatEther(balRaw)).toFixed(4);
        } catch {
          balObj[cron.address] = "0.0";
        }
      }
      if (!ignore) setBalances(balObj);
    }
    fetchBalances();
    return () => { ignore = true; };
  }, [publicClient, crons]);

  return { crons, loading, error, balances, refreshData };
}