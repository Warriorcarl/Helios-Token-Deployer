# Helios Chronos - Mintable Token Cron Jobs

## New Feature: Mintable ERC20 Token with Cron Jobs

This new feature allows users to:

### 🪙 Deploy Mintable ERC20 Token
- Token with `mint()` and `burn()` functions callable by anyone
- Dynamic token supply (not fixed)
- Decimals: 18 (ERC20 standard)
- Public mint: anyone can mint tokens
- Burn: only token holders can burn their tokens

### ⏰ Cron Jobs for Token Management
- **Mint Cron Job**: Automatically mint a specified amount of tokens every X blocks
- **Burn Cron Job**: Automatically burn a specified amount of tokens every X blocks
- Configurable mint/burn amount (default: 1 token)
- Frequency: 1-10 blocks
- Expiration: 1-10000 blocks

### 🔄 Deployment Workflow
1. **Choose Deployment Mode**: Simple Test Contract or Mintable ERC20 Token
2. **Configure Token**: 
   - Token name (3-30 characters, alphanumeric + spaces)
   - Token symbol (2-5 characters, uppercase letters)
   - Default amount for cron job
   - Choose method: mint or burn
3. **Deploy Token**: Gas limit ~800,000
4. **Setup Cron Job**:
   - Target: deployed token contract
   - Method: mint(amount) or burn(amount)
   - Frequency and expiration
5. **Monitor**: Token supply changes automatically according to cron job

### 📊 Supply Impact Prediction
- Display estimated supply changes after N executions
- Example: mint 1 token every 2 blocks = +100 tokens after 100 executions
- Warning for burn operations (requires sufficient balance)

### 🎯 Use Cases
- **Inflationary Token**: Auto-mint to increase supply
- **Deflationary Token**: Auto-burn to decrease supply
- **Balanced Token**: Combination of mint and burn cron jobs
- **Testing**: Dynamically changing supply for testing DeFi protocols

### 🚀 Technical Features
- Uses ethers.js for parameter encoding
- Support for amount in wei (18 decimals)
- Comprehensive input validation
- Error handling for insufficient balance (burn)
- Transaction tracking and logging
- LocalStorage for storing deployed token info

## Demo Flow

1. Open Helios Chronos Cron Job Manager
2. Tab "Create" > Select "Mintable ERC20 Token"
3. Fill Token Name: "Auto Mint Token"
4. Fill Token Symbol: "AMT"
5. Set Default Mint Amount: "10"
6. Deploy token
7. After successful deployment, configure cron job:
   - Method: mint(10 AMT)
   - Frequency: 5 blocks
   - Expiration: 1000 blocks
8. Create cron job
9. Token supply will increase by 10 AMT every 5 blocks automatically!

The deployed token will have:
- Initial supply: 0 AMT
- After 1 execution: 10 AMT  
- After 10 executions: 100 AMT
- After 100 executions: 1000 AMT

Supply will continue to increase until the cron job expires or is manually stopped.
