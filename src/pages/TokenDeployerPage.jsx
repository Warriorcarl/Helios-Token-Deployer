import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';

// Import separated modules
import { TOKEN_DEPLOYER_ADDRESS, TOKEN_DEPLOYER_ABI } from '../constants/abi';
import { TokenDeploymentManager, LogoManager, InputSanitizer } from '../logic';
import { EXPLORER_URL, URLUtils } from '../logic';
import { DebugLogger, TransactionDebugger } from '../debug/debugUtils';
import { 
  TokenUIElements,
  TokenFormElements,
  TokenButtonElements,
  TokenLayoutElements,
  LOGO_OPTIONS
} from '../components/ui/TokenUIComponents';

export default function TokenDeployerPage() {
  const { isConnected } = useAccount();
  
  // Theme management
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  
  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Form state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [logoOption, setLogoOption] = useState('generate');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  
  // UI state
  const [deployedTokenInfo, setDeployedTokenInfo] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [symbolError, setSymbolError] = useState('');
  const [supplyError, setSupplyError] = useState('');
  
  const consoleEndRef = useRef(null);

  // Initialize managers
  const debugLogger = useRef(new DebugLogger()).current;
  const deploymentManager = useRef(new TokenDeploymentManager()).current;
  
  // Track processed transactions to prevent duplicates
  const processedTxRef = useRef({ lastHash: null, successLogged: false });

  // Contract hooks
  const { data: txHash, isPending: isWriteLoading, writeContract, isError: isWriteError, error: writeError } = useContractWrite();
  const { data: txReceipt, isLoading: isTxLoading, isSuccess: isTxSuccess, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  // Input handlers with validation using separated logic
  const handleTokenSymbolChange = (e) => {
    const sanitized = InputSanitizer.sanitizeTokenSymbol(e.target.value);
    setTokenSymbol(sanitized);
    
    const validation = deploymentManager.validateTokenSymbol(sanitized);
    setSymbolError(validation.isValid ? '' : validation.error);
  };

  const handleTotalSupplyChange = (e) => {
    const sanitized = InputSanitizer.sanitizeNumericInput(e.target.value);
    setTotalSupply(sanitized);
    
    const validation = deploymentManager.validateTotalSupply(sanitized);
    setSupplyError(validation.isValid ? '' : validation.error);
  };

  const handleTokenNameChange = (e) => {
    const sanitized = InputSanitizer.sanitizeTokenName(e.target.value);
    setTokenName(sanitized);
  };

  // Logging utility using debug logger
  const addLog = (message, type = 'info') => {
    const logEntry = debugLogger.addLog(message, type);
    setDeploymentLogs(prevLogs => [...prevLogs, logEntry]);
  };

  useEffect(() => { 
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [deploymentLogs]);

  // Transaction status management with debugging
  useEffect(() => {
    if (isWriteLoading && !processedTxRef.current.successLogged) {
      setProgress(30);
      setStatus({ message: 'Confirm transaction in your wallet...', type: 'info' });
      addLog('Awaiting transaction confirmation...');
      TransactionDebugger.logTransactionStart('DEPLOY_TOKEN', { tokenName, tokenSymbol, totalSupply });
      processedTxRef.current.successLogged = false;
    } else if (isTxLoading && !processedTxRef.current.successLogged) {
      setProgress(75);
      setStatus({ message: `Transaction processing...`, type: 'info' });
      addLog('Transaction sent. Waiting for blockchain confirmation...');
    } else if (isTxSuccess && txReceipt && txHash && processedTxRef.current.lastHash !== txHash) {
      setProgress(100);
      setStatus({ message: '✔️ Token deployed successfully!', type: 'success' });
      
      // Mark this transaction as processed
      processedTxRef.current.lastHash = txHash;
      processedTxRef.current.successLogged = true;
      
      // Single comprehensive log entry instead of multiple separate ones
      const txLink = txHash ? URLUtils.formatTransactionLink(txHash) : '';
      
      if (deployedTokenInfo) {
        addLog(
          `<b>✔️ Token Deployed Successfully!</b><br/>
          Name: ${deployedTokenInfo.name}<br/>
          Symbol: ${deployedTokenInfo.symbol}<br/>
          Supply: ${deployedTokenInfo.supply}<br/>
          ${txLink ? `${txLink}` : ''}`,
          'success'
        );
      }
      
      TransactionDebugger.logTransactionSuccess('DEPLOY_TOKEN', txHash, txReceipt);
      deploymentManager.updateDenomSeed();
      resetForm();
      
      // Reset flags after a delay
      setTimeout(() => {
        processedTxRef.current.successLogged = false;
        processedTxRef.current.lastHash = null;
      }, 2000);
    } else if (isWriteError || isTxError) {
      let errMsg = (writeError || txError)?.shortMessage || (writeError || txError)?.message || '';
      
      if (errMsg.includes('Missing or invalid parameters')) {
        const errorMessage = 'Error: Missing or invalid parameters. Double check you have provided the correct parameters';
        setStatus({ message: errorMessage, type: 'error' });
        addLog(errorMessage, 'error');
      } else {
        setStatus({ message: `Error: ${errMsg}`, type: 'error' });
        addLog(`Error: ${errMsg}`, 'error');
      }
      
      setProgress(0);
      TransactionDebugger.logTransactionError('DEPLOY_TOKEN', writeError || txError);
      processedTxRef.current.successLogged = false;
    }
  }, [isWriteLoading, isTxLoading, isTxSuccess, isWriteError, isTxError, txHash, txReceipt, writeError, txError]);

  // Form reset utility
  const resetForm = () => {
    setTokenName('');
    setTokenSymbol('');
    setTotalSupply('');
    setLogoOption('generate');
    setLogoPreview('');
    setLogoBase64('');
    setDeployedTokenInfo(null);
  };

  // Logo generation using separated logic
  const generateLogo = () => {
    try {
      const symbol = tokenSymbol || "TKN";
      const logoDataUrl = LogoManager.generateLogo(symbol);
      setLogoPreview(logoDataUrl);
      setLogoBase64(LogoManager.extractBase64(logoDataUrl));
      setStatus({ message: "Generative logo created!", type: 'success' });
    } catch (error) {
      addLog(`Logo generation failed: ${error.message}`, 'error');
    }
  };

  // Image upload handling using separated logic
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const processedImage = await LogoManager.processUploadedImage(file);
      setLogoPreview(processedImage);
      setLogoBase64(LogoManager.extractBase64(processedImage));
      setStatus({ message: "Image processed successfully!", type: "success" });
    } catch (error) {
      addLog(`Image processing failed: ${error.message}`, 'error');
      setStatus({ message: `Image processing failed: ${error.message}`, type: "error" });
    }
  };

  // Deploy handler using separated logic
  const handleDeploy = () => {
    try {
      const args = deploymentManager.prepareDeploymentArgs(
        tokenName, 
        tokenSymbol, 
        totalSupply, 
        logoOption === 'none' ? '' : logoBase64
      );

      setDeploymentLogs([]);
      addLog('Starting deployment...');
      setDeployedTokenInfo({ 
        name: tokenName, 
        symbol: tokenSymbol, 
        supply: totalSupply 
      });

      writeContract({
        address: TOKEN_DEPLOYER_ADDRESS,
        abi: TOKEN_DEPLOYER_ABI,
        functionName: 'createErc20',
        args: args,
      });
    } catch (error) {
      addLog(`Deployment preparation failed: ${error.message}`, 'error');
      setStatus({ message: error.message, type: 'error' });
    }
  };

  // Logo option change handler
  const handleLogoOptionChange = (e) => {
    setLogoOption(e.target.value);
    setLogoPreview('');
    setLogoBase64('');
  };

  // Left panel with form
  const leftPanel = (
    <TokenLayoutElements.TokenCard>
      <TokenLayoutElements.CardHeader 
        title="Token Parameters" 
        icon={<TokenUIElements.DiamondIcon />} 
      />
      
      <TokenFormElements.TokenNameInput
        value={tokenName}
        onChange={handleTokenNameChange}
      />
      
      <TokenFormElements.TokenSymbolInput
        value={tokenSymbol}
        onChange={handleTokenSymbolChange}
        maxLength={5}
      />
      {symbolError && <TokenUIElements.StatusMessage message={symbolError} type="error" />}
      
      <TokenFormElements.TotalSupplyInput
        value={totalSupply}
        onChange={handleTotalSupplyChange}
      />
      {supplyError && <TokenUIElements.StatusMessage message={supplyError} type="error" />}
      
      <TokenLayoutElements.LogoSection>
        <TokenFormElements.LogoSelector
          value={logoOption}
          onChange={handleLogoOptionChange}
          options={LOGO_OPTIONS}
        />
        
        {logoPreview && <TokenUIElements.LogoPreview src={logoPreview} />}
        
        <TokenLayoutElements.LogoActions>
          {logoOption === 'generate' && (
            <TokenButtonElements.GenerateLogoButton onClick={generateLogo} />
          )}
          
          {logoOption === 'upload' && (
            <>
              <TokenButtonElements.UploadImageButton 
                onClick={() => document.getElementById('fileUpload').click()} 
              />
              <TokenFormElements.HiddenFileInput
                id="fileUpload"
                onChange={handleImageUpload}
              />
            </>
          )}
        </TokenLayoutElements.LogoActions>
      </TokenLayoutElements.LogoSection>
      
      <TokenLayoutElements.DeployActions>
        <TokenButtonElements.DeployButton
          onClick={handleDeploy}
          disabled={!isConnected || isWriteLoading || isTxLoading || !!symbolError || !!supplyError}
          loading={isWriteLoading || isTxLoading}
        />
      </TokenLayoutElements.DeployActions>
      
      {(isWriteLoading || isTxLoading || isTxSuccess) && (
        <TokenUIElements.ProgressBar progress={progress} />
      )}
      
      {status.message && (
        <TokenUIElements.StatusMessage message={status.message} type={status.type} />
      )}
    </TokenLayoutElements.TokenCard>
  );

  // Right panel with console
  const rightPanel = (
    <TokenLayoutElements.ConsoleContainer>
      <TokenLayoutElements.ConsoleLog
        logs={deploymentLogs}
        consoleEndRef={consoleEndRef}
      />
    </TokenLayoutElements.ConsoleContainer>
  );

  return (
    <DefaultLayout
      title="Helios Token Creator"
      description="Create and deploy your own ERC20 tokens easily (PRECOMPILED)."
      
      left={leftPanel}
      right={rightPanel}
      connectButton={<ConnectButton />}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    />
  );
}