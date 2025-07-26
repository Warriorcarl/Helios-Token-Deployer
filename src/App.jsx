import React, { useState, useEffect, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// --- Icon Components ---
const DiamondIcon = () => <svg className="animated-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 12l10 10 10-10L12 2z" /></svg>;
const PaintIcon = () => <svg className="animated-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" /><path d="M12 5a7 7 0 0 0-7 7c0 1.63.56 3.14 1.5 4.36L12 12l5.5-3.64A6.96 6.96 0 0 0 12 5z" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 4h2v3h-2V4zM4 11h3v2H4v-2zm13 0h3v2h-3v-2zM11 17h2v3h-2v-3zM6.414 6.414l2.122-2.122 1.414 1.414-2.122 2.122-1.414-1.414zM14.05 15.464l2.122-2.122 1.414 1.414-2.122 2.122-1.414-1.414zM6.414 17.586l-1.414-1.414 2.122-2.122 1.414 1.414-2.122 2.122zM15.464 8.536l-1.414-1.414 2.122-2.122 1.414 1.414-2.122 2.122zM9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5A9.5 9.5 0 1 0 21.5 12 9.5 9.5 0 0 0 12 2.5zm0 1.5a8 8 0 0 1 5.373 14.127A7.5 7.5 0 1 1 5.873 8.627A7.942 7.942 0 0 1 12 4z"/></svg>;

// --- Config & ABI ---
const PRECOMPILE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000806';
const EXPLORER_URL = 'https://explorer.helioschainlabs.org';
const contractABI = [ { "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "string", "name": "denom", "type": "string" }, { "internalType": "uint256", "name": "totalSupply", "type": "uint256" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }, { "internalType": "string", "name": "logoBase64", "type": "string" } ], "name": "createErc20", "outputs": [ { "internalType": "address", "name": "tokenAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenAddress", "type": "address" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" } ], "name": "ERC20Created", "type": "event" } ];

function App() {
  const { isConnected } = useAccount();
  const [theme, setTheme] = useState('dark');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [logoOption, setLogoOption] = useState('none');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [deployedTokenInfo, setDeployedTokenInfo] = useState(null);
  
  const [status, setStatus] = useState({ message: '', type: '' });
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const consoleEndRef = useRef(null);

  const { data: txHash, isPending: isWriteLoading, writeContract, isError: isWriteError, error: writeError } = useContractWrite();
  const { data: txReceipt, isLoading: isTxLoading, isSuccess: isTxSuccess, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setDeploymentLogs(prevLogs => [...prevLogs, { timestamp, message, type }]);
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [deploymentLogs]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (isWriteLoading) {
      setProgress(30);
      setStatus({ message: 'Confirm transaction in your wallet...', type: 'info' });
      addLog('Awaiting transaction confirmation...');
    } else if (isTxLoading) {
      setProgress(75);
      setStatus({ message: `Transaction processing...`, type: 'info' });
      addLog('Transaction sent. Waiting for blockchain confirmation...');
    } else if (isTxSuccess && txReceipt) {
      setProgress(100);
      setStatus({ message: '✔️ Token deployed successfully!', type: 'success' });
      let tokenAddress = null;
      const eventTopic = '0x8f14c26b4b73516574488b888a24c816b3b3554a999059da1f49de9079a4a79c';
      const eventLog = txReceipt.logs.find(log => log.topics[0] === eventTopic);
      if (eventLog) tokenAddress = `0x${eventLog.topics[2].slice(26)}`;
      const txLink = `<a href="${EXPLORER_URL}/tx/${txHash}" target="_blank" rel="noopener noreferrer">View Transaction</a>`;
      addLog('✔️ Deployment successful!', 'success');
      if (deployedTokenInfo) {
        addLog(`Token Name: ${deployedTokenInfo.name}`, 'success');
        addLog(`Token Symbol: ${deployedTokenInfo.symbol}`, 'success');
        addLog(`Total Supply: ${deployedTokenInfo.supply}`, 'success');
      }
      if (tokenAddress) addLog(`Token Address: ${tokenAddress}`, 'success');
      addLog(txLink, 'success');
      resetForm();
    } else if (isWriteError || isTxError) {
        const error = writeError || txError;
        setStatus({ message: `Error: ${error?.shortMessage || error.message}`, type: 'error' });
        addLog(`Error: ${error?.shortMessage || error.message}`, 'error');
        setProgress(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWriteLoading, isTxLoading, isTxSuccess]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const resetForm = () => {
    setTokenName('');
    setTokenSymbol('');
    setTotalSupply('');
    setLogoOption('none');
    setLogoPreview('');
    setLogoBase64('');
    setDeployedTokenInfo(null);
  };

  const generateRandomString = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleDeploy = () => {
    if (!tokenName || !tokenSymbol || !totalSupply) {
      setStatus({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }
    setDeploymentLogs([]);
    addLog('Starting deployment...');
    setDeployedTokenInfo({ name: tokenName, symbol: tokenSymbol, supply: totalSupply });
    const randomDenom = `a${tokenSymbol.toLowerCase()}-${generateRandomString(6)}`;
    writeContract({
        address: PRECOMPILE_CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'createErc20',
        args: [tokenName, tokenSymbol, randomDenom, parseUnits(totalSupply, 18), 18, logoOption === 'none' ? '' : logoBase64],
    });
  };

  // ... (generateLogo and handleImageUpload functions remain the same)
  const generateLogo = () => {
    const symbol = tokenSymbol || "TKN";
    const canvas = document.createElement("canvas");
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 200, 200);
    const blues = ['#00aeff', '#008fcc', '#38bdf8'];
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.strokeStyle = blues[Math.floor(Math.random() * blues.length)];
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.globalAlpha = Math.random() * 0.4 + 0.2;
      ctx.arc(Math.random() * 200, Math.random() * 200, Math.random() * 60 + 20, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 70px 'Panchang', sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00aeff'; ctx.shadowBlur = 15;
    ctx.fillText(symbol.slice(0, 3).toUpperCase(), 100, 100);
    const pngUrl = canvas.toDataURL("image/png");
    setLogoPreview(pngUrl);
    setLogoBase64(pngUrl.replace(/^data:image\/png;base64,/, ""));
    setStatus({ message: "Generative logo created!", type: 'success' });
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 200; canvas.height = 200;
            const ctx = canvas.getContext("2d");
            const scale = Math.min(200 / img.width, 200 / img.height);
            ctx.drawImage(img, (200 - img.width * scale) / 2, (200 - img.height * scale) / 2, img.width * scale, img.height * scale);
            const pngUrl = canvas.toDataURL("image/png");
            setLogoPreview(pngUrl);
            setLogoBase64(pngUrl.replace(/^data:image\/png;base64,/, ""));
            setStatus({ message: "Image processed successfully!", type: "success" });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="app-container">
      <div className="left-column">
        <div className="section">
          <h2><DiamondIcon /> Token Parameters</h2>
          <input type="text" placeholder="Token Name (e.g. My Token)" value={tokenName} onChange={e => setTokenName(e.target.value)} />
          <input type="text" placeholder="Token Symbol (e.g. MYT)" value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value)} />
          <input type="number" placeholder="Total Supply (e.g. 1000000)" value={totalSupply} onChange={e => setTotalSupply(e.target.value)} />

          <div id="logoOptions" style={{marginTop: '1rem'}}>
            <h3><PaintIcon /> Token Logo</h3>
            <select value={logoOption} onChange={e => { setLogoOption(e.target.value); setLogoPreview(''); }}>
              <option value="none">No logo</option>
              <option value="upload">Upload image</option>
              <option value="generate">Generate logo</option>
            </select>
            
            {logoOption === 'upload' && <input type="file" accept="image/*" onChange={handleImageUpload} />}
            {logoOption === 'generate' && <button onClick={generateLogo}>Generate Generative Logo</button>}
            
            {logoPreview && <img id="logoPreview" src={logoPreview} alt="Logo Preview" style={{display: 'block'}} />}
          </div>

          <button onClick={handleDeploy} disabled={!isConnected || isWriteLoading || isTxLoading} className="deploy-button" style={{marginTop: '1.5rem'}}>
            {isWriteLoading || isTxLoading ? 'Deploying...' : 'Deploy Token'}
          </button>
          
          {(isWriteLoading || isTxLoading || isTxSuccess) && (
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
      </div>
      
      <div className="right-column">
        <div className="right-column-header">
          <h1>Helios Token Deployer</h1>
          <div className="header-actions">
            <button className="theme-switcher" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <ConnectButton />
          </div>
        </div>
        <div className="details-container">
           <h3>Deployment Console</h3>
           <div className="console-log">
              {deploymentLogs.length > 0 ? deploymentLogs.map((log, index) => (
                  <div key={index} className="log-entry">
                      <span className="log-timestamp">{log.timestamp}</span>
                      <span className={`log-message ${log.type}`} dangerouslySetInnerHTML={{ __html: log.message }}></span>
                  </div>
              )) : <span>Awaiting deployment...</span>}
              <div ref={consoleEndRef} />
           </div>
        </div>
      </div>
    </div>
  );
}

export default App;