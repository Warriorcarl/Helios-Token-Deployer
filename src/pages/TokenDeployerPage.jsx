import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// SVG Components
const DiamondIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="#2997ff" style={{marginRight: "7px"}}><path d="M12 2L2 12l10 10 10-10L12 2z" /></svg>;
const PaintIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#2997ff"><circle cx="12" cy="12" r="9" stroke="#2997ff" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="4" fill="#2997ff"/></svg>;
const FileIcon = () => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="6" fill="#D7E0FF"/><path d="M10 10h12v2H10zm0 6h12v2H10z" fill="#002DCB"/></svg>;

const contractABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "string", "name": "denom", "type": "string" },
      { "internalType": "uint256", "name": "totalSupply", "type": "uint256" },
      { "internalType": "uint8", "name": "decimals", "type": "uint8" },
      { "internalType": "string", "name": "logoBase64", "type": "string" }
    ],
    "name": "createErc20",
    "outputs": [
      { "internalType": "address", "name": "tokenAddress", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" }
    ],
    "name": "ERC20Created",
    "type": "event"
  }
];

const PRECOMPILE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000806';
const EXPLORER_URL = 'https://explorer.helioschainlabs.org';

export default function TokenDeployerPage() {
  const { isConnected } = useAccount();
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

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [logoOption, setLogoOption] = useState('generate');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [deployedTokenInfo, setDeployedTokenInfo] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [symbolError, setSymbolError] = useState('');
  const [denomSeed, setDenomSeed] = useState(Date.now());
  const [supplyError, setSupplyError] = useState('');
  const consoleEndRef = useRef(null);

  const { data: txHash, isPending: isWriteLoading, writeContract, isError: isWriteError, error: writeError } = useContractWrite();
  const { data: txReceipt, isLoading: isTxLoading, isSuccess: isTxSuccess, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  const handleTokenSymbolChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setTokenSymbol(value);
    if (value.length > 5) {
      setSymbolError('Token symbol cannot be more than 5 characters.');
    } else {
      setSymbolError('');
    }
  };

  const handleTotalSupplyChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '' || value === '0') {
      setSupplyError('Total supply must be a positive number.');
    } else {
      setSupplyError('');
    }
    setTotalSupply(value);
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setDeploymentLogs(prevLogs => [...prevLogs, { timestamp, message, type }]);
  };
  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [deploymentLogs]);

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
      if (deployedTokenInfo) {
        addLog(`✔️ Token deployed!`, 'success');
        addLog(`Name: ${deployedTokenInfo.name}`, 'success');
        addLog(`Symbol: ${deployedTokenInfo.symbol}`, 'success');
        addLog(`Supply: ${deployedTokenInfo.supply}`, 'success');
      }
      if (txHash) {
        addLog(`<a href="${EXPLORER_URL}/tx/${txHash}" target="_blank" rel="noopener noreferrer">View Transaction</a>`, 'success');
      }
      setDenomSeed(Date.now());
      resetForm();
    } else if (isWriteError || isTxError) {
      let errMsg = (writeError || txError)?.shortMessage || (writeError || txError)?.message || '';
      if (errMsg.includes('Missing or invalid parameters')) {
        setStatus({ message: 'Error: Missing or invalid parameters. Double check you have provided the correct parameters', type: 'error' });
        addLog('Error: Missing or invalid parameters. Double check you have provided the correct parameters', 'error');
      } else {
        setStatus({ message: `Error: ${errMsg}`, type: 'error' });
        addLog(`Error: ${errMsg}`, 'error');
      }
      setProgress(0);
    }
  }, [isWriteLoading, isTxLoading, isTxSuccess]);

  const resetForm = () => {
    setTokenName('');
    setTokenSymbol('');
    setTotalSupply('');
    setLogoOption('generate');
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

  const getRandomDenom = (symbol) => {
    return `a${symbol.toLowerCase()}-${generateRandomString(6)}-${denomSeed}`;
  };

  const handleDeploy = () => {
    if (!tokenName || !tokenSymbol || !totalSupply) {
      setStatus({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }
    if (tokenSymbol.length > 5) {
      setSymbolError('Token symbol cannot be more than 5 characters.');
      setStatus({ message: 'Token symbol cannot be more than 5 characters.', type: 'error' });
      return;
    }
    if (!/^[1-9][0-9]*$/.test(totalSupply)) {
      setSupplyError('Total supply must be a positive number.');
      setStatus({ message: 'Total supply must be a positive number.', type: 'error' });
      return;
    }
    const denom = getRandomDenom(tokenSymbol);
    setDeploymentLogs([]);
    addLog('Starting deployment...');
    setDeployedTokenInfo({ name: tokenName, symbol: tokenSymbol, supply: totalSupply });
    writeContract({
        address: PRECOMPILE_CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'createErc20',
        args: [tokenName, tokenSymbol, denom, parseUnits(totalSupply, 18), 18, logoOption === 'none' ? '' : logoBase64],
    });
  };

  const generateLogo = () => {
    const symbol = tokenSymbol || "TKN";
    const canvas = document.createElement("canvas");
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 200, 200);
    ctx.save();
    ctx.shadowColor = "#00fdff";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(100, 100, 90, 0, 2 * Math.PI);
    ctx.strokeStyle = "#2997ff";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(100 + Math.random()*50-25, 100 + Math.random()*50-25, Math.random()*35+10, 0, 2 * Math.PI);
      ctx.strokeStyle = "#2997ff";
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    let fontSize = 70;
    if (symbol.length > 3) fontSize = 45;
    if (symbol.length > 4) fontSize = 36;
    ctx.font = `bold ${fontSize}px 'Panchang', sans-serif`;
    ctx.fillStyle = "#eaf6ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#00fdff";
    ctx.shadowBlur = 12;
    ctx.fillText(symbol.slice(0, 5).toUpperCase(), 100, 110);

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

  const leftPanel = (
    <div className="token-card">
      <div className="card-header">
        <span className="card-header-title">
          <DiamondIcon /> Token Parameters
        </span>
      </div>
      <input type="text" placeholder="Token Name (e.g. My Token)" value={tokenName} onChange={e => setTokenName(e.target.value)} />
      <input
        type="text"
        placeholder="Token Symbol (e.g. MYT)"
        value={tokenSymbol}
        onChange={handleTokenSymbolChange}
        maxLength={5}
      />
      {symbolError && <div className="status error">{symbolError}</div>}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Total Supply (e.g. 1000000)"
        value={totalSupply}
        onChange={handleTotalSupplyChange}
        style={{MozAppearance:'textfield'}}
        autoComplete="off"
      />
      {supplyError && <div className="status error">{supplyError}</div>}
      <div className="logo-section">
        <span className="logo-title">
          <PaintIcon /> Token Logo
        </span>
        <select value={logoOption} onChange={e => { setLogoOption(e.target.value); setLogoPreview(''); }}>
          <option value="none">No logo</option>
          <option value="upload">Upload image</option>
          <option value="generate">Generate logo</option>
        </select>
        {logoPreview && <img className="logo-preview" src={logoPreview} alt="Logo Preview" />}
        <div className="logo-actions">
          {logoOption === 'generate' && (
            <button type="button" className="logo-generate-btn" onClick={generateLogo}>
              <span>Generate</span>
              <span>Random Logo</span>
            </button>
          )}
          {logoOption === 'upload' && (
            <button type="button" className="logo-generate-btn" style={{background:"#D7E0FF",color:"#002DCB"}} onClick={()=>document.getElementById('fileUpload').click()}>
              <FileIcon />
              <span>Upload</span>
              <span>Image</span>
              <input id="fileUpload" type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload} />
            </button>
          )}
        </div>
      </div>
      <div className="deploy-actions">
        <button onClick={handleDeploy} disabled={!isConnected || isWriteLoading || isTxLoading || !!symbolError || !!supplyError} className="deploy-button">
          {isWriteLoading || isTxLoading ? 'Deploying...' : 'Deploy Token'}
        </button>
      </div>
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
  );

  const rightPanel = (
    <div className="details-container">
      <h3>Deployment Console</h3>
      <div className="console-log">
        {deploymentLogs.length > 0 ? deploymentLogs.map((log, idx) => (
          <div key={idx} className="log-entry">
            <span className="log-timestamp">{log.timestamp}</span>
            <span className={`log-message ${log.type}`} dangerouslySetInnerHTML={{ __html: log.message }} />
          </div>
        )) : <span>Awaiting deployment...</span>}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );

  return (
    <DefaultLayout
      title="Helios Token Deployer"
      left={leftPanel}
      right={rightPanel}
      connectButton={<ConnectButton />}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    />
  );
}