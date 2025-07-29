import React, { useEffect, useState } from "react";
import { useAccount, usePublicClient, useContractWrite, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatEther } from "viem";

const CHRONOS_ADDRESS = "0x0000000000000000000000000000000000000830";
const CHRONOS_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "cronId", "type": "uint256" },
      { "internalType": "uint256", "name": "newFrequency", "type": "uint256" },
      { "internalType": "string[]", "name": "newParams", "type": "string[]" },
      { "internalType": "uint256", "name": "newExpirationBlock", "type": "uint256" },
      { "internalType": "uint256", "name": "newGasLimit", "type": "uint256" },
      { "internalType": "uint64", "name": "newMaxGasPrice", "type": "uint64" }
    ],
    "name": "updateCron",
    "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" } ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint64", "name": "cronId", "type": "uint64" }
    ],
    "name": "cancelCron",
    "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" } ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const EXPLORER_URL = "https://explorer.helioschainlabs.org";

function formatAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 7) + "..." + addr.slice(-6);
}

export default function MyCronsList({ onAction, blockNumber }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [crons, setCrons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formVals, setFormVals] = useState({});
  const [cancelingId, setCancelingId] = useState(null);
  const [depositingId, setDepositingId] = useState(null);
  const [depositValue, setDepositValue] = useState("");
  const [depositTxHash, setDepositTxHash] = useState(null);
  const [depositStatus, setDepositStatus] = useState("");
  const [balances, setBalances] = useState({}); // { aliasAddr: "balance" }

  // Wagmi for update/cancel
  const { writeContract: writeUpdate, data: updateTxHash, isPending: isUpdatePending } = useContractWrite();
  const { writeContract: writeCancel, data: cancelTxHash, isPending: isCancelPending } = useContractWrite();
  const { writeContract: writeDeposit } = useContractWrite();

  const { isLoading: isUpdateTxLoading, isSuccess: isUpdateTxSuccess } = useWaitForTransactionReceipt({ hash: updateTxHash });
  const { isLoading: isCancelTxLoading, isSuccess: isCancelTxSuccess } = useWaitForTransactionReceipt({ hash: cancelTxHash });
  const { isLoading: isDepositLoading, isSuccess: isDepositTxSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash });

  // Fetch crons (no polling)
  useEffect(() => {
    let ignore = false;
    const fetchCrons = async () => {
      if (!isConnected || !address || !publicClient) return;
      setLoading(true);
      setErr("");
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
        setErr("Failed to fetch your crons: " + String(e?.message || e));
      }
      setLoading(false);
    };
    fetchCrons();
  }, [isConnected, address, publicClient, isUpdateTxSuccess, isCancelTxSuccess, isDepositTxSuccess]);

  // Fetch ETH balance for each alias wallet (getEthBalance style)
  useEffect(() => {
    if (!publicClient || !crons.length) return;
    let ignore = false;
    const fetchBalances = async () => {
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
    };
    fetchBalances();
    return () => { ignore = true; }
  }, [publicClient, crons]);

  // Form handlers (update only frequency & expirationBlock)
  const handleEdit = (cron) => {
    setEditingId(cron.id);
    setFormVals({
      newFrequency: cron.frequency,
      newExpiration: "",
      blockNow: blockNumber || 0,
      currentExp: cron.expirationBlock
    });
  };

  const handleCancel = (cronId) => {
    setCancelingId(cronId);
    writeCancel({
      address: CHRONOS_ADDRESS,
      abi: CHRONOS_ABI,
      functionName: "cancelCron",
      args: [BigInt(cronId)]
    });
    if (onAction) onAction("cancel", cronId);
  };

  const handleUpdate = (cron) => {
    let freq = parseInt(formVals.newFrequency, 10);
    let addExp = parseInt(formVals.newExpiration, 10);
    if (isNaN(freq) || freq < 1) freq = 1;
    if (freq > 10) freq = 10;
    if (isNaN(addExp) || addExp < 1) addExp = 1;
    if (addExp > 10000) addExp = 10000;
    const newExpirationBlock = (blockNumber || 0) + addExp;
    if (newExpirationBlock <= (blockNumber || 0)) return;
    writeUpdate({
      address: CHRONOS_ADDRESS,
      abi: CHRONOS_ABI,
      functionName: "updateCron",
      args: [
        BigInt(cron.id),
        BigInt(freq),
        [],
        BigInt(newExpirationBlock),
        BigInt(cron.gasLimit), // keep as is
        parseUnits("5", 9) // keep as is
      ]
    });
    setEditingId(null);
    if (onAction) onAction("update", cron.id, {frequency:freq,expiration:newExpirationBlock});
  };

  // Deposit ke alias address
  const handleDeposit = (cronId, aliasAddr) => {
    setDepositingId(cronId);
    setDepositValue("");
    setDepositTxHash(null);
    setDepositStatus("");
  };
  const sendDeposit = (aliasAddr) => {
    setDepositStatus("");
    writeDeposit({
      address: aliasAddr,
      abi: [],
      functionName: undefined,
      args: [],
      value: parseUnits(depositValue || "0", 18)
    }, {
      onSuccess: (tx) => setDepositTxHash(tx.hash),
      onError: (err) => setDepositStatus("Deposit failed: " + (err?.message || ""))
    });
  };
  useEffect(() => {
    if (isDepositTxSuccess) {
      setDepositStatus("Deposit success!");
      setDepositingId(null);
    }
  }, [isDepositTxSuccess]);

  useEffect(() => {
    if (isCancelTxSuccess) setCancelingId(null);
  }, [isCancelTxSuccess]);
  useEffect(() => {
    if (isUpdateTxSuccess) setEditingId(null);
  }, [isUpdateTxSuccess]);

  if (!isConnected) return <div className="cron-empty-msg">Connect your wallet to see your cron jobs.</div>;
  if (loading) return <div className="cron-empty-msg">Loading your cron jobs...</div>;
  if (err) return <div className="cron-err-msg">{err}</div>;
  if (!crons.length) return <div className="cron-empty-msg">No cron jobs found for this wallet.</div>;

  return (
    <div>
      <div className="cron-list-wrap">
        {crons.map((c, idx) => (
          <div className="cron-list-item" key={idx} style={{position:'relative'}}>
            <div className="cron-list-meta" style={{flex:1}}>
              <span className="cronid-label">CronId:<span className="cronid-value">{c.id}</span></span>
              <div className="cron-list-detail">
                <strong>Target:</strong>{" "}
                <a
                  href={`https://explorer.helioschainlabs.org/address/${c.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{color:"#2997ff",textDecoration:"underline",fontWeight:600}}
                >
                  {formatAddr(c.contractAddress)}
                </a>
              </div>
              <div className="cron-list-detail">
                <strong>Alias:</strong> {formatAddr(c.address)}{" "}
                <span style={{color:"#30b18a",fontWeight:700}}>| {balances[c.address] || "0.0"} HLS</span>
              </div>
              <div className="cron-list-detail">
                <strong>Freq:</strong> {c.frequency} &nbsp;
                <strong>Exp:</strong> {c.expirationBlock === "0" ? "∞" : c.expirationBlock}
              </div>
            </div>
            {/* Tombol View di kanan atas, action sejajar di bawah */}
            <a
              className="cron-action-btn view"
              href={`${EXPLORER_URL}/address/${c.address}?tab=crons`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position:'absolute',right:'20px',top:'14px',zIndex:1,
                minWidth:74,maxWidth:110,whiteSpace:'nowrap',fontWeight:600
              }}
            >View</a>
            {editingId === c.id ? (
              <div className="cron-edit-row" style={{marginTop:12,marginBottom:0,width:"100%",flexWrap:'wrap',display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{display:"flex",alignItems:"center",gap:'5px'}}>
                  <label style={{fontSize:"13px",color:"#2997ff",fontWeight:600,minWidth:62}}>Frequency</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formVals.newFrequency}
                    onChange={e=>setFormVals(v=>({...v,newFrequency:e.target.value}))}
                    style={{width:70}}
                  />
                  <span style={{fontSize:'13px',color:'#888'}}>1-10</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:'5px'}}>
                  <label style={{fontSize:"13px",color:"#2997ff",fontWeight:600,minWidth:106}}>Expiration Block</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formVals.newExpiration}
                    onChange={e=>setFormVals(v=>({...v,newExpiration:e.target.value}))}
                    style={{width:90}}
                  />
                  <span style={{fontSize:'13px',color:'#888'}}>+ Block (1-10000)</span>
                </div>
                <span style={{fontSize:'12px',color:'#888',marginLeft:8}}>Current Block: <b>{blockNumber || "-"}</b></span>
                <button
                  className="cron-action-btn"
                  onClick={()=>handleUpdate(c)}
                  disabled={
                    isUpdatePending || isUpdateTxLoading ||
                    parseInt(formVals.newFrequency) < 1 || parseInt(formVals.newFrequency) > 10 ||
                    parseInt(formVals.newExpiration) < 1 || parseInt(formVals.newExpiration) > 10000
                  }
                >Save</button>
                <button
                  className="cron-action-btn"
                  style={{background:"#777"}}
                  onClick={()=>setEditingId(null)}
                >Cancel</button>
              </div>
            ) : depositingId === c.id ? (
              <div className="cron-deposit-row" style={{marginTop:12,marginBottom:0,width:"100%",flexWrap:'wrap'}}>
                <input
                  type="number"
                  min="0"
                  value={depositValue}
                  onChange={e=>setDepositValue(e.target.value)}
                  placeholder="Amount HLS"
                />
                <button
                  className="cron-action-btn deposit"
                  onClick={()=>sendDeposit(c.address)}
                  disabled={isDepositLoading || !depositValue}
                >Send</button>
                <button
                  className="cron-action-btn"
                  style={{background:"#777"}}
                  onClick={()=>setDepositingId(null)}
                >Cancel</button>
                {depositStatus && <div style={{fontSize:"11px",color:"var(--cron-blue)"}}>{depositStatus}</div>}
              </div>
            ) : (
              <div
                className="cron-action-group"
                style={{
                  width:"100%",
                  justifyContent:"flex-start",
                  gap:'10px',
                  marginTop:16,
                  display:"flex",
                  flexDirection:"row",
                  flexWrap:'wrap'
                }}
              >
                <button
                  className="cron-action-btn"
                  onClick={()=>handleEdit(c)}
                  disabled={editingId !== null || depositingId !== null}
                  style={{minWidth:92,fontWeight:600,fontSize:"1.05rem"}}
                >Update</button>
                <button
                  className="cron-action-btn cancel"
                  onClick={()=>handleCancel(c.id)}
                  disabled={cancelingId === c.id || isCancelPending || isCancelTxLoading}
                  style={{minWidth:92,fontWeight:600,fontSize:"1.05rem"}}
                >{cancelingId === c.id ? "Cancelling..." : "Cancel"}</button>
                <button
                  className="cron-action-btn deposit"
                  onClick={()=>handleDeposit(c.id, c.address)}
                  disabled={editingId !== null || depositingId !== null}
                  style={{minWidth:92,fontWeight:600,fontSize:"1.05rem"}}
                >Deposit</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .cron-list-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .cron-action-group {
          width: 100%;
          gap: 10px;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
        }
        @media (max-width: 700px) {
          .cron-list-item {
            padding: 13px 8px 13px 10px;
          }
          .cron-action-group, .cron-edit-row, .cron-deposit-row {
            flex-direction: column !important;
            gap: 7px !important;
            width: 100%;
            margin-top: 10px !important;
          }
          .cron-action-btn {
            width: 100%;
            min-width: 0 !important;
            font-size: 1.08rem !important;
          }
          .cron-action-btn.view {
            position: static !important;
            width: auto;
            margin-bottom: 6px;
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
}