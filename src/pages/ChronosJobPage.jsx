import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite, useWaitForTransactionReceipt, usePublicClient, useContractRead } from 'wagmi';
import { parseUnits, parseEther, formatEther } from 'viem';
import MyCronsList from '../components/MyCronsList';
import '../pages/cron-style.css';

const COUNTER_CONTRACT = "0x0B036881a81A3f25b01702845DB8F555E448B07e";
const CHRONOS_ADDRESS = "0x0000000000000000000000000000000000000830";
const EXPLORER_URL = 'https://explorer.helioschainlabs.org';

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#2997ff" style={{marginRight:"7px"}}><circle cx="12" cy="12" r="10" stroke="#2997ff" strokeWidth="2" fill="none"/><path d="M12 7v5l3 3" stroke="#2997ff" strokeWidth="2" fill="none"/></svg>
);

export default function ChronosJobManager({ theme: themeProp, onToggleTheme, connectButton }) {
  const { address, isConnected } = useAccount();
  const [theme, setTheme] = useState(themeProp || 'dark');
  const [blockNumber, setBlockNumber] = useState(0);
  const [tab, setTab] = useState('create');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [frequency, setFrequency] = useState('1');
  const [expirationOffset, setExpirationOffset] = useState('1000');

  const publicClient = usePublicClient();
  const consoleEndRef = useRef(null);

  // Block number polling (update every 5s)
  useEffect(() => {
    let ignore = false;
    async function updateBlock() {
      if (publicClient) {
        try {
          const n = await publicClient.getBlockNumber();
          if (!ignore) setBlockNumber(Number(n));
        } catch {}
      }
    }
    updateBlock();
    const intv = setInterval(updateBlock, 5000);
    return () => { ignore = true; clearInterval(intv); }
  }, [publicClient]);

  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [consoleLogs]);

  const { data: txCreateHash, isPending: isCreatePending, writeContract: writeCreate, isError: isCreateError, error: createError } = useContractWrite();
  const { data: txCreateReceipt, isLoading: isCreateTxLoading, isSuccess: isCreateTxSuccess, isError: isCreateTxError, error: createTxError } =
    useWaitForTransactionReceipt({ hash: txCreateHash });

  // Add log utility
  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setConsoleLogs(prev => [...prev, { timestamp, message: msg, type }]);
  };

  // Handle status bar and progress
  useEffect(() => {
    if (isCreatePending) {
      setProgress(30); setStatus({ message: 'Confirm transaction in your wallet...', type: 'info' }); addLog('Awaiting transaction confirmation...');
    } else if (isCreateTxLoading) {
      setProgress(75); setStatus({ message: 'Transaction processing...', type: 'info' }); addLog('Transaction sent. Waiting for blockchain confirmation...');
    } else if (isCreateTxSuccess && txCreateReceipt) {
      setProgress(100);
      setStatus({ message: '✔️ Cron job created!', type: 'success' });
      addLog('✔️ Cron job created!', 'success');
      if (txCreateHash) addLog(`<a href="${EXPLORER_URL}/tx/${txCreateHash}" target="_blank" rel="noopener noreferrer">View Transaction</a>`, 'success');
      // Log detail
      addLog(
        `<b>Cron Created:</b><br/>
        Frequency: ${frequency}<br/>
        Expiration Block: ${blockNumber + Number(expirationOffset)}<br/>
        Current Block: ${blockNumber}<br/>
        Target: <a href="https://explorer.helioschainlabs.org/address/${COUNTER_CONTRACT}" target="_blank" rel="noopener noreferrer">${COUNTER_CONTRACT}</a><br/>`,
        "success"
      );
      resetForm();
    } else if (isCreateError || isCreateTxError) {
      let errMsg = (createError || createTxError)?.shortMessage || (createError || createTxError)?.message || '';
      setStatus({ message: `Error: ${errMsg}`, type: 'error' }); addLog(`Error: ${errMsg}`, 'error'); setProgress(0);
    }
  }, [
    isCreatePending, isCreateTxLoading, isCreateTxSuccess, isCreateError, isCreateTxError
  ]);

  function resetForm() {
    setFrequency('1');
    setExpirationOffset('1000');
  }

  // Handler create, validate input
  const handleCreateCron = () => {
    let freq = parseInt(frequency, 10);
    let exp = parseInt(expirationOffset, 10);
    if (isNaN(freq) || freq < 1) freq = 1;
    if (freq > 10) freq = 10;
    if (isNaN(exp) || exp < 1) exp = 1;
    if (exp > 10000) exp = 10000;
    if (!blockNumber || blockNumber <= 0) return;
    const amountToDeposit = parseEther("1");
    const incrementAbi = JSON.stringify([
      { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ]);
    const expBlk = BigInt(blockNumber + exp);
    writeCreate({
      address: CHRONOS_ADDRESS,
      abi: [
        {
          "inputs": [
            { "internalType": "address", "name": "contractAddress", "type": "address" },
            { "internalType": "string", "name": "abi", "type": "string" },
            { "internalType": "string", "name": "methodName", "type": "string" },
            { "internalType": "string[]", "name": "params", "type": "string[]" },
            { "internalType": "uint64", "name": "frequency", "type": "uint64" },
            { "internalType": "uint64", "name": "expirationBlock", "type": "uint64" },
            { "internalType": "uint64", "name": "gasLimit", "type": "uint64" },
            { "internalType": "uint256", "name": "maxGasPrice", "type": "uint256" },
            { "internalType": "uint256", "name": "amountToDeposit", "type": "uint256" }
          ],
          "name": "createCron",
          "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: 'createCron',
      args: [
        COUNTER_CONTRACT,
        incrementAbi,
        "increment",
        [],
        BigInt(freq),
        expBlk,
        BigInt(1500000), // default
        parseUnits("5", 9), // default
        amountToDeposit
      ]
    });
  };

  const leftPanel = (
    <div className="cron-main-card">
      <div className="cron-header-row">
        <span className="cron-header-title"><ClockIcon /> Cron Job Manager</span>
      </div>
      <div className="cron-tab-row" style={{marginBottom:'16px'}}>
        <button className={tab === "create" ? "cron-tab-btn selected" : "cron-tab-btn"}
          onClick={() => setTab("create")}
          style={{fontWeight:700}}
        >Create</button>
        <button className={tab === "mycrons" ? "cron-tab-btn selected" : "cron-tab-btn"}
          onClick={() => setTab("mycrons")}
        >My Cron Jobs</button>
      </div>
      <div className="cron-content-inner" style={{marginTop: tab === "create" ? "8px" : "0"}}>
        {tab === "create" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{marginBottom:'13px',fontSize:'14px',color:'var(--cron-tab-inactive)',width:'100%',textAlign:'left'}}>
              Target: <a href={`https://explorer.helioschainlabs.org/address/${COUNTER_CONTRACT}`} style={{color:'var(--cron-blue)',textDecoration:"underline",fontWeight:600}} target="_blank" rel="noopener noreferrer">{COUNTER_CONTRACT}</a> — <span style={{fontWeight:600}}>increment()</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'15px',width:"100%",maxWidth:320}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{color:'#2997ff',fontWeight:600}}>Frequency</div>
                  <div style={{fontSize:'13px',color:'#888'}}>1-10</div>
                </div>
                <input
                  className="cron-input-box"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Frequency"
                  value={frequency}
                  onChange={e=>setFrequency(e.target.value.replace(/[^0-9]/g,''))}
                  style={{width:100,marginBottom:0,textAlign:'center'}}
                />
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{color:'#2997ff',fontWeight:600}}>Expiration Block</div>
                  <div style={{fontSize:'13px',color:'#888'}}>+ Block (1-10000)</div>
                </div>
                <input
                  className="cron-input-box"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="Expiration Block (+)"
                  value={expirationOffset}
                  onChange={e=>setExpirationOffset(e.target.value.replace(/[^0-9]/g,''))}
                  style={{width:100,marginBottom:0,textAlign:'center'}}
                />
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{color:'#888',fontSize:'14px',fontWeight:600}}>Current Block</div>
                <div style={{color:'#2997ff',fontSize:'15px',fontWeight:700}}>{blockNumber || "-"}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{color:'#888',fontSize:'14px',fontWeight:600}}>Exp:</div>
                <div style={{color:'#2997ff',fontSize:'15px',fontWeight:700}}>
                  {blockNumber && expirationOffset ? (Number(blockNumber) + Number(expirationOffset)) : "-"}
                </div>
              </div>
            </div>
            <button onClick={handleCreateCron}
              disabled={!isConnected || isCreatePending || isCreateTxLoading ||
                parseInt(frequency) < 1 || parseInt(frequency) > 10 ||
                parseInt(expirationOffset) < 1 || parseInt(expirationOffset) > 10000}
              className="cron-btn-main"
              style={{marginTop:24,width:'100%',maxWidth:340}}>
              {isCreatePending || isCreateTxLoading ? 'Creating...' : 'Create Cron Job'}
            </button>
            {(isCreatePending || isCreateTxLoading || isCreateTxSuccess) && (
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            {status.message && (
              <div className={`status ${status.type}`}>
                <span>{status.message}</span>
              </div>
            )}
          </div>
        )}
        {tab === "mycrons" && (
          <MyCronsList blockNumber={blockNumber} onAction={addLog} />
        )}
      </div>
    </div>
  );

  const rightPanel = (
    <div className="details-container">
      <h3 style={{fontFamily:"Panchang,sans-serif",fontSize:"2rem",fontWeight:700,marginTop:6,marginBottom:18}}>Console</h3>
      <div className="console-log" style={{minHeight:"180px"}}>
        {consoleLogs.length > 0 ? consoleLogs.map((log, idx) => (
          <div key={idx} className="log-entry">
            <span className="log-timestamp">{log.timestamp}</span>
            <span className={`log-message ${log.type}`} dangerouslySetInnerHTML={{ __html: log.message }} />
          </div>
        )) : <span>Awaiting action...</span>}
        <div ref={consoleEndRef} />
      </div>
      <div style={{marginTop:'18px',fontSize:'12px',color:'var(--cron-tab-inactive)'}}>
        <a href="https://hub.helioschain.network" target="_blank" rel="noopener noreferrer">Helios Chain Info</a> | 
        <a href="https://explorer.helioschainlabs.org" target="_blank" rel="noopener noreferrer" style={{marginLeft:'6px'}}>Explorer</a>
      </div>
      <hr style={{margin:'16px 0',borderColor:'#2223'}}/>
      <CounterStatus />
    </div>
  );

  function CounterStatus() {
    const { data, isLoading } = useContractRead({
      address: COUNTER_CONTRACT,
      abi: [
        { inputs: [], name: "counter", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }
      ],
      functionName: "counter"
    });
    return (
      <div style={{fontSize:'15px',marginTop:'7px',color:'var(--cron-blue)',fontWeight:'bold'}}>
        Counter Value:{' '}
        {isLoading ? <span style={{color:'var(--cron-tab-inactive)'}}>Loading...</span> : <span>{String(data)}</span>}
      </div>
    );
  }

  useEffect(() => {
    if (themeProp) setTheme(themeProp);
    else {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [themeProp]);
  const handleToggleTheme = onToggleTheme || (() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  return (
    <DefaultLayout
      title="Helios Chronos Cron Job"
      left={leftPanel}
      right={rightPanel}
      connectButton={connectButton || <ConnectButton />}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    />
  );
}