import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite, useSendTransaction, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { parseUnits } from 'viem';
import MyCronsList from '../components/MyCronsList';
import SimpleTestDeployForm from '../components/cron/SimpleTestDeployForm';
import MintableTokenDeployForm from '../components/cron/MintableTokenDeployForm';
import CronJobCreateForm from '../components/cron/CronJobCreateForm';
import MintableTokenCronForm from '../components/cron/MintableTokenCronForm';
import SimpleCronForm from '../components/cron/SimpleCronForm';
import DeploymentStepIndicator from '../components/cron/DeploymentStepIndicator';
import '../pages/cron-style.css';

// Import separated modules using index files
import { 
  CronJobManager, 
  SimpleTestDeploymentManager, 
  DeploymentStepManager,
  MintableTokenManager
} from '../logic';
import { 
  CHRONOS_ADDRESS, 
  CHRONOS_ABI, 
  SIMPLE_TEST_CONTRACT_CONFIG,
  MINTABLE_TOKEN_CONFIG
} from '../constants/abi';
import { EXPLORER_URL, URLUtils } from '../logic';
import { DebugLogger, TransactionDebugger } from '../debug/debugUtils';
import { 
  CronUIElements, 
  FormElements, 
  ButtonElements, 
  LayoutElements, 
  ConsoleElements 
} from '../components/ui/CronUIComponents';
import { getOptimizedGasPrice } from '../utils/gasOptimization';

export default function ChronosJobManager({ theme: themeProp, onToggleTheme, connectButton }) {
  const { address, isConnected } = useAccount();
  const [theme, setTheme] = useState(themeProp || 'dark');
  const [blockNumber, setBlockNumber] = useState(0);
  const [tab, setTab] = useState('create');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ message: '', type: '' });
  
  // Deployment mode selection
  const [deploymentMode, setDeploymentMode] = useState('simple-test'); // 'simple-test', 'mintable-token', or 'simple-cron'
  
  // Create cron tab mode
  const [createCronTab, setCreateCronTab] = useState('simple'); // 'simple' or 'advanced'
  
  // Original create cron states - Updated to use time-based frequency defaults
  const [frequency, setFrequency] = useState('300'); // Default to 15 minutes (300 blocks)
  const [expirationOffset, setExpirationOffset] = useState('1000');

  // New deployment states
  const [deploymentStep, setDeploymentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [deployedWarriorAddress, setDeployedWarriorAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('testConnection');
  const [deploymentError, setDeploymentError] = useState('');
  
  // Mintable token specific states
  const [tokenInfo, setTokenInfo] = useState({
    tokenName: '',
    tokenSymbol: '',
    mintAmount: '1'
  });

  const publicClient = usePublicClient();
  const consoleEndRef = useRef(null);

  // Initialize managers
  const debugLogger = useRef(new DebugLogger()).current;
  const cronManager = useRef(new CronJobManager(blockNumber)).current;
  const deploymentManager = useRef(new SimpleTestDeploymentManager()).current;
  const mintableTokenManager = useRef(new MintableTokenManager()).current;
  const stepManager = useRef(new DeploymentStepManager()).current;

  // Track processed transactions to prevent duplicates - with processing locks
  const processedTxRef = useRef({ 
    lastDeployHash: null, 
    lastCreateHash: null,
    deploySuccessLogged: false,
    createSuccessLogged: false,
    deployProcessing: false,  // Processing lock
    createProcessing: false   // Processing lock
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

  // Handle deployment status (both Simple Test Contract and Mintable Token)
  useEffect(() => {
    if (isDeployPending && !processedTxRef.current.deployProcessing) {
      processedTxRef.current.deployProcessing = true;
      setProgress(30); 
      
      const contractType = deploymentMode === 'mintable-token' ? 'Mintable ERC20 Token' : 'Simple Test Contract';
      setStatus({ message: `Confirm ${contractType} deployment in your wallet...`, type: 'info' }); 
      addLog(`Awaiting ${contractType} deployment confirmation...`);
      
      const debugType = deploymentMode === 'mintable-token' ? 'DEPLOY_MINTABLE_TOKEN' : 'DEPLOY_SIMPLE_CONTRACT';
      TransactionDebugger.logTransactionStart(debugType, { selectedMethod, tokenInfo });
      
    } else if (isDeployTxLoading && processedTxRef.current.deployProcessing) {
      setProgress(75); 
      
      const contractType = deploymentMode === 'mintable-token' ? 'Mintable ERC20 Token' : 'Simple Test Contract';
      setStatus({ message: `${contractType} deployment processing...`, type: 'info' }); 
      addLog(`${contractType} deployment sent. Waiting for blockchain confirmation...`);
      
    } else if (isDeployTxSuccess && deployTxReceipt && deployTxHash && 
               processedTxRef.current.lastDeployHash !== deployTxHash && 
               processedTxRef.current.deployProcessing) {
      
      // LOCK: Prevent any further processing of this transaction
      processedTxRef.current.lastDeployHash = deployTxHash;
      processedTxRef.current.deploySuccessLogged = true;
      processedTxRef.current.deployProcessing = false;
      
      setProgress(100);
      
      // Extract deployed contract address
      const deployedAddress = deployTxReceipt.contractAddress;
      setDeployedWarriorAddress(deployedAddress);
      
      if (deploymentMode === 'mintable-token') {
        // Handle mintable token deployment success
        setStatus({ message: '✔️ Mintable ERC20 Token deployed successfully!', type: 'success' });
        
        // Store token deployment info
        mintableTokenManager.storeDeployedToken(deployedAddress, deployTxHash, blockNumber, tokenInfo);
        
        // Complete step 1 and advance to step 2
        stepManager.completeStep(1, { address: deployedAddress, method: selectedMethod, tokenInfo });
        setCompletedSteps([1]);
        setDeploymentStep(2);
        
        const contractLink = URLUtils.formatAddressLink(deployedAddress, deployedAddress);
        const txLink = URLUtils.formatTransactionLink(deployTxHash);
        
        addLog(
          `<b>✔️ Mintable ERC20 Token Deployed Successfully!</b><br/>
          Contract Address: ${contractLink}<br/>
          Token Name: ${tokenInfo.tokenName}<br/>
          Token Symbol: ${tokenInfo.tokenSymbol}<br/>
          Selected Cron Method: ${selectedMethod}(${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol})<br/>
          ${txLink}`,
          "success"
        );
        
        // If burn method is selected, perform initial mint
        if (selectedMethod === 'burn') {
          addLog('🔄 Performing initial mint for burn method...', 'info');
          
          try {
            const initialMintTx = mintableTokenManager.prepareInitialMintForBurn(
              deployedAddress, 
              tokenInfo.mintAmount
            );
            
            // Send initial mint transaction
            sendDeployTx(initialMintTx);
            addLog(`📝 Initial mint of ${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol} sent`, 'info');
            
          } catch (error) {
            addLog(`❌ Initial mint failed: ${error.message}`, 'error');
          }
        }
        
        TransactionDebugger.logTransactionSuccess('DEPLOY_MINTABLE_TOKEN', deployTxHash, deployTxReceipt);
        
      } else {
        // Handle simple test contract deployment success
        setStatus({ message: '✔️ Simple Test Contract deployed successfully!', type: 'success' });
        
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
      }
      
    } else if ((isDeployError || isDeployTxError) && processedTxRef.current.deployProcessing) {
      processedTxRef.current.deployProcessing = false;
      let errMsg = (deployError || deployTxError)?.shortMessage || (deployError || deployTxError)?.message || '';
      
      const contractType = deploymentMode === 'mintable-token' ? 'Mintable Token' : 'Simple Test Contract';
      setStatus({ message: `${contractType} Deployment Error: ${errMsg}`, type: 'error' }); 
      setDeploymentError(errMsg);
      addLog(`${contractType} deployment failed: ${errMsg}`, 'error'); 
      setProgress(0);
      
      const debugType = deploymentMode === 'mintable-token' ? 'DEPLOY_MINTABLE_TOKEN' : 'DEPLOY_SIMPLE_CONTRACT';
      TransactionDebugger.logTransactionError(debugType, deployError || deployTxError);
    }
  }, [
    isDeployPending, isDeployTxLoading, isDeployTxSuccess, isDeployError, isDeployTxError,
    deployTxHash, deployTxReceipt, deployError, deployTxError, deploymentMode, selectedMethod, tokenInfo
  ]);

  // Handle cron creation status  
  useEffect(() => {
    if (isCreatePending && !processedTxRef.current.createProcessing) {
      processedTxRef.current.createProcessing = true;
      setProgress(30); 
      setStatus({ message: 'Confirm cron job creation in your wallet...', type: 'info' }); 
      addLog('Awaiting cron job creation confirmation...');
      
      const debugType = deploymentMode === 'mintable-token' ? 'CREATE_CRON_WITH_MINTABLE_TOKEN' : 'CREATE_CRON_WITH_WARRIOR';
      TransactionDebugger.logTransactionStart(debugType, { 
        contractAddress: deployedWarriorAddress, 
        method: selectedMethod,
        frequency, 
        expirationOffset,
        tokenInfo: deploymentMode === 'mintable-token' ? tokenInfo : null
      });
    } else if (isCreateTxLoading && processedTxRef.current.createProcessing) {
      setProgress(75); 
      setStatus({ message: 'Cron job creation processing...', type: 'info' }); 
      addLog('Cron job creation sent. Waiting for blockchain confirmation...');
    } else if (isCreateTxSuccess && txCreateReceipt && txCreateHash && 
               processedTxRef.current.lastCreateHash !== txCreateHash && 
               processedTxRef.current.createProcessing) {
      
      // LOCK: Prevent any further processing of this transaction
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
      
      if (deploymentMode === 'mintable-token') {
        // Mintable token cron success message
        addLog(
          `<b>✔️ Mintable Token Cron Job Created Successfully!</b><br/>
          Target Token: ${contractLink}<br/>
          Token: ${tokenInfo.tokenName} (${tokenInfo.tokenSymbol})<br/>
          Method: ${selectedMethod}(${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol})<br/>
          Frequency: Every ${frequency} blocks<br/>
          Expiration Block: ${cronManager.calculateExpirationBlock(expirationOffset)}<br/>
          Current Block: ${blockNumber}<br/>
          ${txLink}`,
          "success"
        );
        
        TransactionDebugger.logTransactionSuccess('CREATE_CRON_WITH_MINTABLE_TOKEN', txCreateHash, txCreateReceipt);
      } else {
        // Simple test contract cron success message
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
      }
      
      // AUTO-SWITCH TO MY CRON JOBS TAB AFTER SUCCESS!
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
    txCreateHash, txCreateReceipt, createError, createTxError, deploymentMode, tokenInfo
  ]);

  // Reset deployment form and clear ALL transaction flags
  const resetDeploymentForm = () => {
    setDeploymentStep(1);
    setCompletedSteps([]);
    setDeployedWarriorAddress('');
    setSelectedMethod('testConnection');
    setFrequency('300'); // Default to 15 minutes (300 blocks) for consistency
    setExpirationOffset('1000');
    setDeploymentError('');
    
    // Reset mintable token info
    setTokenInfo({
      tokenName: '',
      tokenSymbol: '',
      mintAmount: '1'
    });
    
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
      addLog('Using simple test contract with random methods', 'info');
      
      // Actual deployment call dengan format yang benar untuk deployment
      sendDeployTx({
        to: null, // null untuk contract creation
        data: deploymentData.bytecode, // bytecode sebagai data
        gas: BigInt(mintableTokenManager.getOptimizedGasLimit('deployment'))
      });
      
    } catch (error) {
      addLog(`Deployment preparation failed: ${error.message}`, 'error');
      setDeploymentError(error.message);
      setStatus({ message: `Deployment Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle Mintable Token deployment - updated for step 1 only
  const handleDeployMintableToken = (tokenData) => {
    try {
      const { tokenName, tokenSymbol } = tokenData;
      
      addLog('🔍 Starting Mintable Token deployment validation...', 'info');
      addLog(`📝 Input data: Name="${tokenName}", Symbol="${tokenSymbol}"`, 'info');
      
      // Validate input - only name and symbol for step 1
      const nameValidation = mintableTokenManager.validateTokenName(tokenName);
      const symbolValidation = mintableTokenManager.validateTokenSymbol(tokenSymbol);
      
      if (!nameValidation.isValid) {
        throw new Error(`Token name validation failed: ${nameValidation.error}`);
      }
      if (!symbolValidation.isValid) {
        throw new Error(`Token symbol validation failed: ${symbolValidation.error}`);
      }
      
      addLog('✅ All input validations passed', 'info');
      
      // Store basic token info (method and amount will be configured in step 2)
      setTokenInfo({ 
        tokenName, 
        tokenSymbol, 
        mintAmount: '100', // default value for step 2
        selectedMethod: 'mint' // default value for step 2
      });
      setDeploymentError('');
      
      addLog('🔧 Generating deployment bytecode...', 'info');
      
      // Get deployment data from manager - using defaults for deployment
      const deploymentData = mintableTokenManager.generateDeploymentData(tokenName, tokenSymbol, 'mint');
      
      addLog(`✅ Deployment data generated successfully`, 'info');
      addLog(`📊 Bytecode length: ${deploymentData.data.length} characters`, 'info');
      addLog(`⛽ Gas limit: ${deploymentData.gasLimit}`, 'info');
      
      addLog('Starting Mintable ERC20 Token deployment...', 'info');
      addLog(`Token Name: ${tokenName}`, 'info');
      addLog(`Token Symbol: ${tokenSymbol}`, 'info');
      addLog('Cron method and amount will be configured in Step 2', 'info');
      
      // Validate deployment data before sending
      if (!deploymentData.data || !deploymentData.data.startsWith('0x')) {
        throw new Error('Invalid deployment bytecode generated');
      }
      
      if (deploymentData.data.length < 100) {
        throw new Error('Deployment bytecode appears to be too short');
      }
      
      addLog('🚀 Sending deployment transaction...', 'info');
      
      // Actual deployment call
      sendDeployTx({
        to: null, // null untuk contract creation
        data: deploymentData.data,
        gas: BigInt(mintableTokenManager.getOptimizedGasLimit('deployment'))
      });
      
    } catch (error) {
      addLog(`❌ Mintable Token deployment preparation failed: ${error.message}`, 'error');
      addLog(`🔍 Error details: ${error.stack || 'No stack trace available'}`, 'error');
      setDeploymentError(error.message);
      setStatus({ message: `Deployment Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle continue to cron creation
  const handleContinueTostep2 = (address, method, tokenData = null) => {
    setDeployedWarriorAddress(address);
    setSelectedMethod(method);
    
    if (tokenData) {
      setTokenInfo(tokenData);
    }
    
    setDeploymentStep(2);
    addLog(`Proceeding to create cron job for contract ${address}`, 'info');
  };

  // Handle cron job creation with Simple Test Contract
  const handleCreateCronWithWarrior = (amountToDeposit, calculatedExpirationBlock) => {
    try {
      // Use new amount-based logic from cronManager
      const args = cronManager.createSimpleCronArgs(frequency, amountToDeposit);
      
      addLog(`Creating cron job with Simple Test Contract ${deployedWarriorAddress}...`, 'info');
      addLog(`Method: ${selectedMethod}()`, 'info');
      addLog(`Frequency: Every ${frequency} blocks`, 'info');
      addLog(`Amount to Deposit: ${amountToDeposit} HLS`, 'info');
      addLog(`Calculated Expiration: Block ${calculatedExpirationBlock}`, 'info');
      
      writeCreate({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: 'createCron',
        args: args
      });
    } catch (error) {
      addLog(`Cron creation failed: ${error.message}`, 'error');
      setStatus({ message: `Cron Creation Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle cron job creation with Mintable Token - updated to use amount and new parameters
  const handleCreateCronWithMintableToken = (amountToDeposit, calculatedExpirationBlock, selectedMethod, tokenAmount) => {
    try {
      // Use new amount-based token cron creation with updated parameters
      const args = mintableTokenManager.prepareCronArgsWithTokenAmount(
        deployedWarriorAddress, 
        selectedMethod || 'mint', 
        tokenAmount || '100',
        frequency, 
        amountToDeposit,
        calculatedExpirationBlock
      );
      
      addLog(`Creating cron job with Mintable Token ${deployedWarriorAddress}...`, 'info');
      addLog(`Method: ${selectedMethod || 'mint'}(${tokenAmount || '100'} tokens)`, 'info');
      addLog(`Frequency: Every ${frequency} blocks`, 'info');
      addLog(`Amount to Deposit: ${amountToDeposit} HLS`, 'info');
      addLog(`Calculated Expiration: Block ${calculatedExpirationBlock}`, 'info');
      
      if (selectedMethod === 'burn') {
        addLog('⚠️  Burn operations will only succeed if sufficient token balance exists', 'warning');
      }
      
      // Store updated token info for success message
      setTokenInfo(prev => ({
        ...prev,
        selectedMethod: selectedMethod || 'mint',
        mintAmount: tokenAmount || '100'
      }));
      
      writeCreate({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: 'createCron',
        args: args
      });
    } catch (error) {
      addLog(`Mintable Token cron creation failed: ${error.message}`, 'error');
      setStatus({ message: `Cron Creation Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle simple cron creation with predefined contracts
  const handleCreateSimpleCron = (targetAddress, targetMethod, amountToDeposit, calculatedExpirationBlock) => {
    try {
      const args = cronManager.createSimpleCronArgs(frequency, amountToDeposit);
      
      addLog(`Creating simple cron job with Simple Test Contract ${targetAddress}...`, 'info');
      addLog(`Method: ${targetMethod}()`, 'info');
      addLog(`Frequency: Every ${frequency} blocks`, 'info');
      addLog(`Amount to Deposit: ${amountToDeposit} HLS`, 'info');
      addLog(`Calculated Expiration: Block ${calculatedExpirationBlock}`, 'info');
      
      writeCreate({
        address: CHRONOS_ADDRESS,
        abi: CHRONOS_ABI,
        functionName: 'createCron',
        args: args
      });
    } catch (error) {
      addLog(`Simple cron creation failed: ${error.message}`, 'error');
      setStatus({ message: `Cron Creation Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle back to step 1
  const handleBackToStep1 = () => {
    setDeploymentStep(1);
    addLog('Returning to Simple Test Contract deployment step', 'info');
  };

  // Tab configuration
  const tabs = [
    { key: 'create', label: '⚡ Create Cron' },
    { key: 'mycrons', label: '📋 My Cron Jobs' }
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
            
            {/* Create Cron Tab Selector */}
            <div className="create-cron-tabs" style={{marginBottom: "4px", width: "100%"}}>
              <div className="tab-selector" style={{
                display: "flex",
                background: "var(--cron-tab-bg)",
                borderRadius: "12px",
                padding: "4px",
                border: "1px solid var(--cron-tab-border)",
                maxWidth: "400px",
                margin: "0 auto",
                gap: "1px"
              }}>
                <button
                  className={`tab-btn ${createCronTab === 'simple' ? 'active' : ''}`}
                  onClick={() => setCreateCronTab('simple')}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: createCronTab === 'simple' ? "var(--cron-blue)" : "transparent",
                    color: createCronTab === 'simple' ? "#fff" : "var(--cron-tab-inactive)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  ⚡ Simple Cron
                </button>
                <button
                  className={`tab-btn ${createCronTab === 'advanced' ? 'active' : ''}`}
                  onClick={() => setCreateCronTab('advanced')}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: createCronTab === 'advanced' ? "var(--cron-blue)" : "transparent",
                    color: createCronTab === 'advanced' ? "#fff" : "var(--cron-tab-inactive)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  🔧 Advanced
                </button>
              </div>
            </div>

            {/* Simple Cron Tab Content */}
            {createCronTab === 'simple' && (
              <SimpleCronForm
                frequency={frequency}
                setFrequency={setFrequency}
                expirationOffset={expirationOffset}
                setExpirationOffset={setExpirationOffset}
                blockNumber={blockNumber}
                onCreateCron={handleCreateSimpleCron}
                isCreating={isCreatePending || isCreateTxLoading}
              />
            )}

            {/* Advanced Cron Tab Content */}
            {createCronTab === 'advanced' && (
              <div className="advanced-cron-content">
                {/* Deployment Mode Selector - Only show for advanced mode */}
                <div className="deployment-mode-selector" style={{marginBottom: "12px", width: "100%"}}>
                  <div className="mode-selector-header">
                    <h3 style={{color: "var(--cron-text-main)", fontSize: "18px", fontWeight: "600", marginBottom: "8px"}}>
                      Choose Deployment Type
                    </h3>
                    <p style={{color: "var(--cron-text-sub)", fontSize: "14px", marginBottom: "12px"}}>
                      Select the type of contract to deploy and create cron jobs for
                    </p>
                  </div>
                  
                  <div className="mode-options" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
                    <button
                      className={`mode-option ${deploymentMode === 'simple-test' ? 'active' : ''}`}
                      onClick={() => setDeploymentMode('simple-test')}
                      style={{
                        padding: "16px",
                        background: deploymentMode === 'simple-test' ? "var(--cron-blue)" : "var(--cron-input-bg)",
                        border: `1px solid ${deploymentMode === 'simple-test' ? "var(--cron-blue)" : "var(--cron-border)"}`,
                        borderRadius: "12px",
                        color: deploymentMode === 'simple-test' ? "#fff" : "var(--cron-text-main)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{textAlign: "left"}}>
                        <div style={{fontSize: "16px", fontWeight: "600", marginBottom: "4px"}}>
                          � Simple Test Contract
                        </div>
                        <div style={{fontSize: "12px", opacity: "0.8"}}>
                          Deploy basic contract with simple functions
                        </div>
                      </div>
                    </button>
                    
                    <button
                      className={`mode-option ${deploymentMode === 'mintable-token' ? 'active' : ''}`}
                      onClick={() => setDeploymentMode('mintable-token')}
                      style={{
                        padding: "16px",
                        background: deploymentMode === 'mintable-token' ? "var(--cron-blue)" : "var(--cron-input-bg)",
                        border: `1px solid ${deploymentMode === 'mintable-token' ? "var(--cron-blue)" : "var(--cron-border)"}`,
                        borderRadius: "12px",
                        color: deploymentMode === 'mintable-token' ? "#fff" : "var(--cron-text-main)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{textAlign: "left"}}>
                        <div style={{fontSize: "16px", fontWeight: "600", marginBottom: "4px"}}>
                          🪙 Mintable ERC20 Token
                        </div>
                        <div style={{fontSize: "12px", opacity: "0.8"}}>
                          Deploy token with public mint/burn functions
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Step Indicator - Only show for advanced mode */}
                <DeploymentStepIndicator 
                  currentStep={deploymentStep}
                  completedSteps={completedSteps}
                />
                
                {/* Step 1: Deploy Contract based on selected mode */}
                {deploymentStep === 1 && deploymentMode === 'simple-test' && (
                  <SimpleTestDeployForm
                    onDeploy={handleDeployWarrior}
                    isDeploying={isDeployPending || isDeployTxLoading}
                    deployedAddress={deployedWarriorAddress}
                    onContinue={handleContinueToStep2}
                    deploymentError={deploymentError}
                  />
                )}
                
                {deploymentStep === 1 && deploymentMode === 'mintable-token' && (
                  <MintableTokenDeployForm
                    onDeploy={handleDeployMintableToken}
                    isDeploying={isDeployPending || isDeployTxLoading}
                    deployedAddress={deployedWarriorAddress}
                    onContinue={handleContinueToStep2}
                    deploymentError={deploymentError}
                  />
                )}
                
                {/* Step 2: Create Cron Job based on deployment mode */}
                {deploymentStep === 2 && deployedWarriorAddress && deploymentMode === 'simple-test' && (
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
                
                {deploymentStep === 2 && deployedWarriorAddress && deploymentMode === 'mintable-token' && (
                  <MintableTokenCronForm
                    targetAddress={deployedWarriorAddress}
                    targetMethod={selectedMethod}
                    tokenInfo={tokenInfo}
                    frequency={frequency}
                    setFrequency={setFrequency}
                    expirationOffset={expirationOffset}
                    setExpirationOffset={setExpirationOffset}
                    blockNumber={blockNumber}
                    onCreateCron={handleCreateCronWithMintableToken}
                    isCreating={isCreatePending || isCreateTxLoading}
                    onBack={handleBackToStep1}
                  />
                )}
              </div>
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
    { text: 'Helios Testnet Dashboard', url: 'https://testnet.helioschain.network/?code=COSMOS-TITAN-230' },
    { text: 'Helios Gate Portal', url: 'https://portal.helioschain.network' }
  ];

  const rightPanel = (
    <ConsoleElements.ConsoleContainer>
      <ConsoleElements.LogDisplay 
        logs={consoleLogs}
        placeholder="Awaiting deployment action..."
        consoleEndRef={consoleEndRef}
      />
      <div ref={consoleEndRef} />
      
      <ConsoleElements.FooterLinks links={footerLinks} />
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
      title="Helios Chronos"
      left={leftPanel}
      right={rightPanel}
      connectButton={connectButton || <ConnectButton />}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    />
  );
}