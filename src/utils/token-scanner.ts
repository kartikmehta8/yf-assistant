import { AgentRuntime } from 'move-agent-kit'
import { TokenBalance } from '../types'
import { logger } from './logger'

/**
 * TokenScanner class for retrieving token balances from Aptos wallets.
 * Supports native APT and other major tokens with USD value calculation.
 */
export class TokenScanner {
	/**
	 * Creates a new TokenScanner instance.
	 * @param agent - AgentRuntime instance for blockchain interactions.
	 */
	constructor(private agent: AgentRuntime) {}

	/**
	 * Scans a wallet address for token balances.
	 * @param address - The Aptos wallet address to scan.
	 * @returns Promise<TokenBalance[]> Array of token balances with USD values.
	 * @throws Error if scanning fails.
	 */
	async scanWallet(address: string): Promise<TokenBalance[]> {
		try {
			const balances: TokenBalance[] = []

			// Get native APT token balance and price.
			const aptBalance = await this.agent.getBalance(address)
			const aptPrice = await this.agent.getTokenPrice('0x1::aptos_coin::AptosCoin')

			balances.push({
				token: 'APT',
				balance: aptBalance,
				decimals: 8, // APT uses 8 decimal places.
				usdValue: aptBalance * aptPrice,
			})

			/**
			 * Scan for other supported tokens.
			 * Includes major stablecoins and liquid staking tokens:
			 * - USDT, USDC: Stablecoins.
			 * - stAPT: Staked APT.
			 * - thAPT: Thala staked APT.
			 * - eAPT: Echo staked APT.
			 */
			const supportedTokens = ['USDT', 'USDC', 'stAPT', 'thAPT', 'eAPT']

			for (const token of supportedTokens) {
				const tokenDetails = await this.agent.getTokenDetails(token)
				if (tokenDetails) {
					const balance = await this.agent.getBalance(address)
					const price = await this.agent.getTokenPrice(token)

					balances.push({
						token: token,
						balance: balance,
						decimals: tokenDetails.decimals,
						usdValue: balance * price,
					})
				}
			}

			return balances
		} catch (error) {
			logger.error('Error scanning wallet', { error, address })
			throw error
		}
	}
}
