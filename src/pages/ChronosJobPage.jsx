import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite, useWaitForTransactionReceipt, usePublicClient, useContractRead } from 'wagmi';
import MyCronsList from '../components/MyCronsList';
import '../pages/cron-style.css';

// Import separated modules using index files
import { CronJobManager } from '../logic';
import { CHRONOS_ADDRESS, CHRONOS_ABI, COUNTER_CONTRACT_ADDRESS, COUNTER_ABI } from '../constants/abi';
import { EXPLORER_URL, URLUtils } from '../logic';
import { DebugLogger, TransactionDebugger } from '../debug/debugUtils';
import { 
  CronUIElements, 
  FormElements, 
  ButtonElements, 
  LayoutElements, 
  ConsoleElements 
} from '../components/ui/CronUIComponents';

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

  // Initialize debug logger and cron manager
  const debugLogger = useRef(new DebugLogger()).current;
  const cronManager = useRef(new CronJobManager(blockNumber)).current;

  // Track processed transactions to prevent duplicates
  const processedTxRef = useRef({ lastHash: null, successLogged: false });

  // Block number polling (update every 5s)
  useEffect(() => {
    let ignore = false;
    async function updateBlock() {
      if (publicClient) {
        try {
          const n = await publicClient.getBlockNumber();
          const newBlock = Number(n);
          if (!ignore && newBlock !== blockNumber) {
            setBlockNumber(newBlock);
            cronManager.updateBlockNumber(newBlock);
          }
        } catch (error) {
          console.error('Block update error:', error);
        }
      }
    }
    updateBlock();
    const intv = setInterval(updateBlock, 5000);
    return () => { ignore = true; clearInterval(intv); }
  }, [publicClient, blockNumber, cronManager]);

  useEffect(() => { 
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [consoleLogs]);

  const { data: txCreateHash, isPending: isCreatePending, writeContract: writeCreate, isError: isCreateError, error: createError } = useContractWrite();
  const { data: txCreateReceipt, isLoading: isCreateTxLoading, isSuccess: isCreateTxSuccess, isError: isCreateTxError, error: createTxError } =
    useWaitForTransactionReceipt({ hash: txCreateHash });

  // Add log utility using debug logger
  const addLog = (msg, type = 'info') => {
    const logEntry = debugLogger.addLog(msg, type);
    setConsoleLogs(prev => [...prev, logEntry]);
  };

  // Handle status bar and progress
  useEffect(() => {
    if (isCreatePending && !processedTxRef.current.successLogged) {
      setProgress(30); 
      setStatus({ message: 'Confirm transaction in your wallet...', type: 'info' }); 
      addLog('Awaiting transaction confirmation...');
      TransactionDebugger.logTransactionStart('CREATE_CRON', { frequency, expirationOffset });
      processedTxRef.current.successLogged = false;
    } else if (isCreateTxLoading && !processedTxRef.current.successLogged) {
      setProgress(75); 
      setStatus({ message: 'Transaction processing...', type: 'info' }); 
      addLog('Transaction sent. Waiting for blockchain confirmation...');
    } else if (isCreateTxSuccess && txCreateReceipt && txCreateHash && processedTxRef.current.lastHash !== txCreateHash) {
      setProgress(100);
      setStatus({ message: '✔️ Cron job created!', type: 'success' });
      
      // Mark this transaction as processed
      processedTxRef.current.lastHash = txCreateHash;
      processedTxRef.current.successLogged = true;
      
      // Single comprehensive log entry
      const contractLink = URLUtils.formatAddressLink(COUNTER_CONTRACT_ADDRESS, COUNTER_CONTRACT_ADDRESS);
      const txLink = URLUtils.formatTransactionLink(txCreateHash);
      
      addLog(
        `<b>✔️ Cron Job Created Successfully!</b><br/>
        Frequency: ${frequency}<br/>
        Expiration Block: ${cronManager.calculateExpirationBlock(expirationOffset)}<br/>
        Current Block: ${blockNumber}<br/>
        Target: ${contractLink}<br/>
        ${txLink}`,
        "success"
      );
      
      TransactionDebugger.logTransactionSuccess('CREATE_CRON', txCreateHash, txCreateReceipt);
      resetForm();
      
      // Reset flags after a delay
      setTimeout(() => {
        processedTxRef.current.successLogged = false;
        processedTxRef.current.lastHash = null;
      }, 2000);
    } else if (isCreateError || isCreateTxError) {
      let errMsg = (createError || createTxError)?.shortMessage || (createError || createTxError)?.message || '';
      setStatus({ message: `Error: ${errMsg}`, type: 'error' }); 
      addLog(`Error: ${errMsg}`, 'error'); 
      setProgress(0);
      TransactionDebugger.logTransactionError('CREATE_CRON', createError || createTxError);
      processedTxRef.current.successLogged = false;
    }
  }, [
    isCreatePending, isCreateTxLoading, isCreateTxSuccess, isCreateError, isCreateTxError,
    txCreateHash, txCreateReceipt, createError, createTxError
  ]); // Removed status.message from dependencies

  function resetForm() {
    setFrequency('1');
    setExpirationOffset('1000');
  }

  // Handler create using cron manager logic
  const handleCreateCron = () => {
    try {
      const args = cronManager.prepareCronCreationArgs(frequency, expirationOffset);
      
      writeCreate({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: 'createCron',
        args: args
      });
    } catch (error) {
      addLog(`Validation Error: ${error.message}`, 'error');
    }
  };

  // Tab configuration
  const tabs = [
    { key: 'create', label: 'Create' },
    { key: 'mycrons', label: 'My Cron Jobs' }
  ];

  const leftPanel = (
    <LayoutElements.Card>
      <LayoutElements.HeaderRow 
        title="Cron Job Manager" 
        icon={<CronUIElements.ClockIcon />} 
      />
      
      <LayoutElements.TabNavigation
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
      />
      
      <LayoutElements.ContentArea style={{marginTop: tab === "create" ? "8px" : "0"}}>
        {tab === "create" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{marginBottom:'13px',fontSize:'14px',color:'var(--cron-tab-inactive)',width:'100%',textAlign:'left'}}>
              Target: <a href={URLUtils.getAddressUrl(COUNTER_CONTRACT_ADDRESS)} style={{color:'var(--cron-blue)',textDecoration:"underline",fontWeight:600}} target="_blank" rel="noopener noreferrer">{COUNTER_CONTRACT_ADDRESS}</a> — <span style={{fontWeight:600}}>increment()</span>
            </div>
            
            <div style={{display:'flex',flexDirection:'column',gap:'15px',width:"100%",maxWidth:320}}>
              <FormElements.NumberInput
                label="Frequency"
                helperText="1-10"
                value={frequency}
                min="1"
                max="10"
                onChange={e => setFrequency(e.target.value.replace(/[^0-9]/g,''))}
              />
              
              <FormElements.NumberInput
                label="Expiration Block"
                helperText="+ Block (1-10000)"
                value={expirationOffset}
                min="1"
                max="10000"
                onChange={e => setExpirationOffset(e.target.value.replace(/[^0-9]/g,''))}
              />
              
              <LayoutElements.InfoRow 
                label="Current Block" 
                value={blockNumber || "-"} 
              />
              
              <LayoutElements.InfoRow 
                label="Exp:" 
                value={blockNumber && expirationOffset ? (Number(blockNumber) + Number(expirationOffset)) : "-"} 
              />
            </div>
            
            <ButtonElements.PrimaryButton
              onClick={handleCreateCron}
              disabled={!isConnected || isCreatePending || isCreateTxLoading ||
                parseInt(frequency) < 1 || parseInt(frequency) > 10 ||
                parseInt(expirationOffset) < 1 || parseInt(expirationOffset) > 10000}
              loading={isCreatePending || isCreateTxLoading}
              style={{marginTop:24,width:'100%',maxWidth:340}}
            >
              Create Cron Job
            </ButtonElements.PrimaryButton>
            
            {(isCreatePending || isCreateTxLoading || isCreateTxSuccess) && (
              <CronUIElements.ProgressBar progress={progress} />
            )}
            
            {status.message && (
              <CronUIElements.StatusMessage message={status.message} type={status.type} />
            )}
          </div>
        )}
        
        {tab === "mycrons" && (
          <MyCronsList blockNumber={blockNumber} onAction={addLog} />
        )}
      </LayoutElements.ContentArea>
    </LayoutElements.Card>
  );

  const footerLinks = [
    { text: 'Helios Chain Info', url: 'https://hub.helioschain.network' },
    { text: 'Explorer', url: EXPLORER_URL }
  ];

  function CounterStatus() {
    const { data, isLoading } = useContractRead({
      address: COUNTER_CONTRACT_ADDRESS,
      abi: COUNTER_ABI,
      functionName: "counter"
    });
    
    return (
      <div style={{fontSize:'15px',marginTop:'7px',color:'var(--cron-blue)',fontWeight:'bold'}}>
        Counter Value:{' '}
        {isLoading ? <span style={{color:'var(--cron-tab-inactive)'}}>Loading...</span> : <span>{String(data)}</span>}
      </div>
    );
  }

  const rightPanel = (
    <ConsoleElements.ConsoleContainer>
      <ConsoleElements.LogDisplay 
        logs={consoleLogs}
        placeholder="Awaiting action..."
      />
      <div ref={consoleEndRef} />
      
      <ConsoleElements.FooterLinks links={footerLinks} />
      
      <hr style={{margin:'16px 0',borderColor:'#2223'}}/>
      <CounterStatus />
    </ConsoleElements.ConsoleContainer>
  );

  // Theme management
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