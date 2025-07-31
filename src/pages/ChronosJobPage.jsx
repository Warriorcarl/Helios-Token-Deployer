import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite, useSendTransaction, useWaitForTransactionReceipt, usePublicClient, useContractRead } from 'wagmi';
import MyCronsList from '../components/MyCronsList';
import SimpleTestDeployForm from '../components/cron/SimpleTestDeployForm';
import CronJobCreateForm from '../components/cron/CronJobCreateForm';
import DeploymentStepIndicator from '../components/cron/DeploymentStepIndicator';
import '../pages/cron-style.css';

// Import separated modules using index files
import { 
  CronJobManager, 
  SimpleTestDeploymentManager, 
  DeploymentStepManager 
} from '../logic';
import { CHRONOS_ADDRESS, CHRONOS_ABI, COUNTER_CONTRACT_ADDRESS, COUNTER_ABI, SIMPLE_TEST_CONTRACT_CONFIG } from '../constants/abi';
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
  
  // Original create cron states
  const [frequency, setFrequency] = useState('1');
  const [expirationOffset, setExpirationOffset] = useState('1000');

  // New deployment states
  const [deploymentStep, setDeploymentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [deployedWarriorAddress, setDeployedWarriorAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('testConnection');
  const [deploymentError, setDeploymentError] = useState('');

  const publicClient = usePublicClient();
  const consoleEndRef = useRef(null);

  // Initialize managers
  const debugLogger = useRef(new DebugLogger()).current;
  const cronManager = useRef(new CronJobManager(blockNumber)).current;
  const deploymentManager = useRef(new SimpleTestDeploymentManager()).current;
  const stepManager = useRef(new DeploymentStepManager()).current;

  // Track processed transactions to prevent duplicates - with processing locks
  const processedTxRef = useRef({ 
    lastDeployHash: null, 
    lastCreateHash: null,
    deploySuccessLogged: false,
    createSuccessLogged: false,
    deployProcessing: false,  // 🔒 Processing lock
    createProcessing: false   // 🔒 Processing lock
  });

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

  // Simple Test Contract deployment hooks - menggunakan useSendTransaction untuk deployment
  const { 
    data: deployTxHash, 
    isPending: isDeployPending, 
    sendTransaction: sendDeployTx, 
    isError: isDeployError, 
    error: deployError 
  } = useSendTransaction();
  
  const { 
    data: deployTxReceipt, 
    isLoading: isDeployTxLoading, 
    isSuccess: isDeployTxSuccess, 
    isError: isDeployTxError, 
    error: deployTxError 
  } = useWaitForTransactionReceipt({ hash: deployTxHash });

  // Cron creation hooks
  const { 
    data: txCreateHash, 
    isPending: isCreatePending, 
    writeContract: writeCreate, 
    isError: isCreateError, 
    error: createError 
  } = useContractWrite();
  
  const { 
    data: txCreateReceipt, 
    isLoading: isCreateTxLoading, 
    isSuccess: isCreateTxSuccess, 
    isError: isCreateTxError, 
    error: createTxError 
  } = useWaitForTransactionReceipt({ hash: txCreateHash });

  // Add log utility using debug logger
  const addLog = (msg, type = 'info') => {
    const logEntry = debugLogger.addLog(msg, type);
    setConsoleLogs(prev => [...prev, logEntry]);
  };

  // Handle Simple Test Contract deployment status
  useEffect(() => {
    if (isDeployPending && !processedTxRef.current.deployProcessing) {
      processedTxRef.current.deployProcessing = true;
      setProgress(30); 
      setStatus({ message: 'Confirm Simple Test Contract deployment in your wallet...', type: 'info' }); 
      addLog('Awaiting Simple Test Contract deployment confirmation...');
      TransactionDebugger.logTransactionStart('DEPLOY_SIMPLE_CONTRACT', { selectedMethod });
    } else if (isDeployTxLoading && processedTxRef.current.deployProcessing) {
      setProgress(75); 
      setStatus({ message: 'Simple Test Contract deployment processing...', type: 'info' }); 
      addLog('Simple Test Contract deployment sent. Waiting for blockchain confirmation...');
    } else if (isDeployTxSuccess && deployTxReceipt && deployTxHash && 
               processedTxRef.current.lastDeployHash !== deployTxHash && 
               processedTxRef.current.deployProcessing) {
      
      // 🔒 LOCK: Prevent any further processing of this transaction
      processedTxRef.current.lastDeployHash = deployTxHash;
      processedTxRef.current.deploySuccessLogged = true;
      processedTxRef.current.deployProcessing = false;
      
      setProgress(100);
      setStatus({ message: '✔️ Simple Test Contract deployed successfully!', type: 'success' });
      
      // Extract deployed contract address
      const deployedAddress = deployTxReceipt.contractAddress;
      setDeployedWarriorAddress(deployedAddress);
      
      // Store deployment info
      deploymentManager.storeDeployedContract(deployedAddress, deployTxHash, blockNumber, selectedMethod);
      
      // Complete step 1 and advance to step 2
      stepManager.completeStep(1, { address: deployedAddress, method: selectedMethod });
      setCompletedSteps([1]);
      setDeploymentStep(2);
      
      const contractLink = URLUtils.formatAddressLink(deployedAddress, deployedAddress);
      const txLink = URLUtils.formatTransactionLink(deployTxHash);
      
      addLog(
        `<b>✔️ Simple Test Contract Deployed Successfully!</b><br/>
        Contract Address: ${contractLink}<br/>
        Selected Method: ${selectedMethod}<br/>
        ${txLink}`,
        "success"
      );
      
      TransactionDebugger.logTransactionSuccess('DEPLOY_SIMPLE_CONTRACT', deployTxHash, deployTxReceipt);
      
    } else if ((isDeployError || isDeployTxError) && processedTxRef.current.deployProcessing) {
      processedTxRef.current.deployProcessing = false;
      let errMsg = (deployError || deployTxError)?.shortMessage || (deployError || deployTxError)?.message || '';
      setStatus({ message: `Deployment Error: ${errMsg}`, type: 'error' }); 
      setDeploymentError(errMsg);
      addLog(`Simple Test Contract deployment failed: ${errMsg}`, 'error'); 
      setProgress(0);
      TransactionDebugger.logTransactionError('DEPLOY_SIMPLE_CONTRACT', deployError || deployTxError);
    }
  }, [
    isDeployPending, isDeployTxLoading, isDeployTxSuccess, isDeployError, isDeployTxError,
    deployTxHash, deployTxReceipt, deployError, deployTxError
  ]);

  // Handle cron creation status  
  useEffect(() => {
    if (isCreatePending && !processedTxRef.current.createProcessing) {
      processedTxRef.current.createProcessing = true;
      setProgress(30); 
      setStatus({ message: 'Confirm cron job creation in your wallet...', type: 'info' }); 
      addLog('Awaiting cron job creation confirmation...');
      TransactionDebugger.logTransactionStart('CREATE_CRON_WITH_WARRIOR', { 
        warriorAddress: deployedWarriorAddress, 
        method: selectedMethod,
        frequency, 
        expirationOffset 
      });
    } else if (isCreateTxLoading && processedTxRef.current.createProcessing) {
      setProgress(75); 
      setStatus({ message: 'Cron job creation processing...', type: 'info' }); 
      addLog('Cron job creation sent. Waiting for blockchain confirmation...');
    } else if (isCreateTxSuccess && txCreateReceipt && txCreateHash && 
               processedTxRef.current.lastCreateHash !== txCreateHash && 
               processedTxRef.current.createProcessing) {
      
      // 🔒 LOCK: Prevent any further processing of this transaction
      processedTxRef.current.lastCreateHash = txCreateHash;
      processedTxRef.current.createSuccessLogged = true;
      processedTxRef.current.createProcessing = false;
      
      setProgress(100);
      setStatus({ message: '✔️ Cron job created successfully!', type: 'success' });
      
      // Complete step 2
      stepManager.completeStep(2, { txHash: txCreateHash });
      setCompletedSteps([1, 2]);
      
      const contractLink = URLUtils.formatAddressLink(deployedWarriorAddress, deployedWarriorAddress);
      const txLink = URLUtils.formatTransactionLink(txCreateHash);
      
      addLog(
        `<b>✔️ Cron Job Created Successfully!</b><br/>
        Target Contract: ${contractLink}<br/>
        Method: ${selectedMethod}<br/>
        Frequency: ${frequency} blocks<br/>
        Expiration Block: ${cronManager.calculateExpirationBlock(expirationOffset)}<br/>
        Current Block: ${blockNumber}<br/>
        ${txLink}`,
        "success"
      );
      
      TransactionDebugger.logTransactionSuccess('CREATE_CRON_WITH_WARRIOR', txCreateHash, txCreateReceipt);
      
      // 🎯 AUTO-SWITCH TO MY CRON JOBS TAB AFTER SUCCESS!
      setTimeout(() => {
        setTab('mycrons');
        addLog('✨ Switched to My Cron Jobs to view your new cron job!', 'info');
      }, 1500);
      
      resetDeploymentForm();
      
    } else if ((isCreateError || isCreateTxError) && processedTxRef.current.createProcessing) {
      processedTxRef.current.createProcessing = false;
      let errMsg = (createError || createTxError)?.shortMessage || (createError || createTxError)?.message || '';
      setStatus({ message: `Cron Creation Error: ${errMsg}`, type: 'error' }); 
      addLog(`Cron job creation failed: ${errMsg}`, 'error'); 
      setProgress(0);
      TransactionDebugger.logTransactionError('CREATE_CRON_WITH_WARRIOR', createError || createTxError);
    }
  }, [
    isCreatePending, isCreateTxLoading, isCreateTxSuccess, isCreateError, isCreateTxError,
    txCreateHash, txCreateReceipt, createError, createTxError
  ]);

  // Reset deployment form and clear ALL transaction flags
  const resetDeploymentForm = () => {
    setDeploymentStep(1);
    setCompletedSteps([]);
    setDeployedWarriorAddress('');
    setSelectedMethod('testConnection');
    setFrequency('1');
    setExpirationOffset('1000');
    setDeploymentError('');
    stepManager.reset();
    
    // 🔥 CRITICAL: Reset ALL transaction tracking flags
    processedTxRef.current = {
      lastDeployHash: null, 
      lastCreateHash: null,
      deploySuccessLogged: false,
      createSuccessLogged: false,
      deployProcessing: false,  // 🔒 Processing lock
      createProcessing: false   // 🔒 Processing lock
    };
  };

  // Handle Simple Test Contract deployment
  const handleDeployWarrior = (method) => {
    try {
      setSelectedMethod(method);
      setDeploymentError('');
      
      // Get deployment data from manager (includes bytecode from simple contract)
      const deploymentData = deploymentManager.prepareDeploymentData();
      
      addLog('Starting Simple Test Contract deployment...', 'info');
      addLog(`Selected method: ${method}`, 'info');
      addLog('Using simple counter-like contract with random methods', 'info');
      
      // Actual deployment call dengan format yang benar untuk deployment
      sendDeployTx({
        to: null, // null untuk contract creation
        data: deploymentData.bytecode, // bytecode sebagai data
        gas: BigInt(SIMPLE_TEST_CONTRACT_CONFIG.DEPLOYMENT_GAS_LIMIT)
      });
      
    } catch (error) {
      addLog(`Deployment preparation failed: ${error.message}`, 'error');
      setDeploymentError(error.message);
      setStatus({ message: `Deployment Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle continue to cron creation
  const handleContinueToStep2 = (address, method) => {
    setDeployedWarriorAddress(address);
    setSelectedMethod(method);
    setDeploymentStep(2);
    addLog(`Proceeding to create cron job for contract ${address}`, 'info');
  };

  // Handle cron job creation with Simple Test Contract
  const handleCreateCronWithWarrior = () => {
    try {
      const args = deploymentManager.prepareCronArgsWithContract(
        deployedWarriorAddress, 
        selectedMethod, 
        frequency, 
        expirationOffset, 
        blockNumber
      );
      
      addLog(`Creating cron job with Simple Test Contract ${deployedWarriorAddress}...`, 'info');
      
      writeCreate({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: 'createCron',
        args: args
      });
    } catch (error) {
      addLog(`Cron creation failed: ${error.message}`, 'error');
    }
  };

  // Handle back to step 1
  const handleBackToStep1 = () => {
    setDeploymentStep(1);
    addLog('Returning to Simple Test Contract deployment step', 'info');
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
            
            {/* Step Indicator */}
            <DeploymentStepIndicator 
              currentStep={deploymentStep}
              completedSteps={completedSteps}
            />
            
            {/* Step 1: Deploy Simple Test Contract */}
            {deploymentStep === 1 && (
              <SimpleTestDeployForm
                onDeploy={handleDeployWarrior}
                isDeploying={isDeployPending || isDeployTxLoading}
                deployedAddress={deployedWarriorAddress}
                onContinue={handleContinueToStep2}
                deploymentError={deploymentError}
              />
            )}
            
            {/* Step 2: Create Cron Job */}
            {deploymentStep === 2 && deployedWarriorAddress && (
              <CronJobCreateForm
                targetAddress={deployedWarriorAddress}
                targetMethod={selectedMethod}
                frequency={frequency}
                setFrequency={setFrequency}
                expirationOffset={expirationOffset}
                setExpirationOffset={setExpirationOffset}
                blockNumber={blockNumber}
                onCreateCron={handleCreateCronWithWarrior}
                isCreating={isCreatePending || isCreateTxLoading}
                onBack={handleBackToStep1}
              />
            )}
            
            {/* Progress and Status */}
            {(isDeployPending || isDeployTxLoading || isCreatePending || isCreateTxLoading || progress > 0) && (
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
        placeholder="Awaiting deployment action..."
        consoleEndRef={consoleEndRef}
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