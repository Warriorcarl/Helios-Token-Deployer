# 🔄 Perbaikan Support Method `mintAndBurn` 

## ❌ Masalah yang Ditemukan

Dari console log terlihat error:
```
11:40:56 Mintable Token cron creation failed: Invalid method. Supported methods: mint, burn
11:41:07 Mintable Token cron creation failed: Invalid method. Supported methods: mint, burn
```

User mencoba menggunakan method `mintAndBurn(1000 LOO)` tetapi validasi menolak method tersebut.

### Root Cause Analysis
1. **Method `mintAndBurn` ada di ABI** ✅ - Terdefinisi di `MINTABLE_ERC20_ABI`
2. **Method `mintAndBurn` ada di UI options** ✅ - Tersedia di `MINTABLE_TOKEN_METHODS`
3. **Method `mintAndBurn` TIDAK didukung dalam validasi** ❌ - Missing di `prepareCronArgsWithToken`

## ✅ Perbaikan yang Diterapkan

### 1. **mintableTokenLogic.js - Validasi Method**
```javascript
// ❌ SEBELUM:
if (!['mint', 'burn'].includes(methodName)) {
  throw new Error(`Invalid method. Supported methods: mint, burn`);
}

// ✅ SESUDAH:
if (!['mint', 'burn', 'mintAndBurn'].includes(methodName)) {
  throw new Error(`Invalid method. Supported methods: mint, burn, mintAndBurn`);
}
```

### 2. **MintableTokenCronForm.jsx - UI Description**
```javascript
// Menambahkan description untuk mintAndBurn
const getMethodDescription = () => {
  if (targetMethod === 'mint') {
    return `Mint ${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol} tokens every ${frequency} blocks`;
  } else if (targetMethod === 'burn') {
    return `Burn ${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol} tokens every ${frequency} blocks`;
  } else if (targetMethod === 'mintAndBurn') {
    return `Mint & Burn ${tokenInfo.mintAmount} ${tokenInfo.tokenSymbol} tokens every ${frequency} blocks (net +${tokenInfo.mintAmount})`;
  }
  return `Execute ${targetMethod}() every ${frequency} blocks`;
};
```

### 3. **Method Details & Gas Calculation**
```javascript
// Menambahkan details untuk mintAndBurn
else if (targetMethod === 'mintAndBurn') {
  return {
    icon: "🔄",
    action: "Minting & Burning",
    description: "Creates new tokens and destroys existing tokens from the caller's balance",
    effect: "Net supply change",
    gasUsage: MINTABLE_TOKEN_CONFIG.MINT_GAS_LIMIT + MINTABLE_TOKEN_CONFIG.BURN_GAS_LIMIT // 95,000 gas
  };
}
```

### 4. **Projected Impact Calculation**
```javascript
// Menambahkan impact calculation untuk mintAndBurn
else if (method === 'mintAndBurn') {
  return {
    type: 'increase',
    amount: totalImpact,
    symbol: '+',
    description: `Supply will increase by ${totalImpact} tokens after ${executions} executions (net effect: mint 2x, burn 1x)`
  };
}
```

## 🔍 Logika Method `mintAndBurn`

### Cara Kerja
1. **Smart Contract**: Method `mintAndBurn(amount)` akan:
   - Mint `2x amount` tokens (menambah supply)
   - Burn `1x amount` tokens dari caller's balance (mengurangi supply)
   - **Net Effect**: `+1x amount` tokens ke total supply

### Contoh Eksekusi
- **Input**: `mintAndBurn(1000)`
- **Action**: Mint 2000 tokens, Burn 1000 tokens
- **Net Result**: +1000 tokens ke total supply
- **Gas Usage**: ~95,000 gas (50k mint + 45k burn)

### Projected Impact (untuk 1000 LOO per execution)
- **Per execution**: +1000 LOO (net effect)
- **After 10 executions**: +10,000 LOO
- **After 100 executions**: +100,000 LOO

## 🎯 Hasil Perbaikan

Setelah perbaikan ini, user dapat:
1. ✅ **Deploy mintable token dengan method `mintAndBurn`**
2. ✅ **Create cron job dengan method `mintAndBurn` tanpa error**
3. ✅ **Melihat projected impact yang akurat**
4. ✅ **Memahami net effect dari operasi mint & burn**

## 📝 File yang Dimodifikasi

- `src/logic/mintableTokenLogic.js` - Validasi method dan impact calculation
- `src/components/cron/MintableTokenCronForm.jsx` - UI description dan projected impact
- `docs/MINTANDBURN_METHOD_FIX.md` - Dokumentasi perbaikan ini

## 🧪 Testing

User sekarang dapat:
- Deploy token dengan method `mintAndBurn` ✅
- Create cron job tanpa error validasi ✅
- Melihat description yang benar di UI ✅
- Memahami gas usage dan impact yang akurat ✅