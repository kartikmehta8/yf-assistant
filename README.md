# DeFi Yield Farming Assistant

The **DeFi Yield Farming Assistant** is an intelligent tool that scans Aptos blockchain protocols (Joule, Thala, Amnis, Echo) to calculate the best yield farming opportunities. It leverages AI to recommend optimal farming strategies with risk analysis.

## Features

- **Automated Yield Scanning**: Retrieves yield information from Joule, Thala, Amnis, and Echo.
- **Risk Analysis**: Evaluates APY volatility, TVL risks, and smart contract risks.
- **AI-Based Strategy Optimization**: Uses Anthropic's Claude-3 AI to suggest risk-adjusted strategies.
- **Break-Even Analysis**: Calculates the required time to recover gas fees.
- **Automated Execution**: Supports staking, unstaking, and lending operations.

## Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/kartikmehta8/yf-assistant.git
   cd yf-assistant
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure environment variables in `.env.example`:
   ```env
   NETWORK=mainnet
   APTOS_PRIVATE_KEY=your_private_key
   ANTHROPIC_API_KEY=your_api_key
   LOG_LEVEL=info
   ```

## Key Components

- `agents/` - Protocol-specific integrations (Joule, Thala, Amnis, Echo).
- `utils/` - Helper functions for logging, APY calculations, and token scanning.
- `config.ts` - Configuration settings for network, logging, and AI.
- `index.ts` - Entry point for running the assistant.

## API Structure

### Yield Analysis
Fetches and ranks the best yield strategies:
```ts
const result = await assistant.analyzeYieldOpportunities(walletAddress);
console.log(result);
```

### Executing Strategies
Automatically executes the best yield strategy:
```ts
await assistant.executeStrategy(strategy);
```

## Supported Protocols

| Protocol | Features |
|---------|----------|
| Joule | Deposit & Borrow |
| Thala | Staking Rewards |
| Amnis | Liquid Staking |
| Echo | Reward Boosting |

## AI-Powered Strategy Recommendation

The assistant uses Anthropic’s Claude-3 model to analyze yield farming strategies based on:

- **APY & TVL comparison** across protocols.
- **Risk assessment** (smart contract risks, low liquidity).
- **Market conditions** for Aptos DeFi.
- **Gas cost and break-even analysis**.

## Security Considerations

- Always **review protocol risks** before executing strategies.
- **Private keys** should be stored securely and never exposed in code.
- Transactions should be simulated before committing to the blockchain.

<h3>
  <p align="center">
     Made with ❤️ by <a href="https://www.mrmehta.in">kartikmehta8</a>
  </p>
</h3>
