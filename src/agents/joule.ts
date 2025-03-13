import { AgentRuntime } from 'move-agent-kit'
import { YieldInfo } from '../types'
import { logger } from '../utils/logger'

/**
 * JouleAgent handles interactions with the Joule protocol.
 * Provides lending and borrowing functionality.
 */
export class JouleAgent {
	constructor(private agent: AgentRuntime) {}

	/**
	 * Retrieves the total value locked (TVL) in the Joule protocol.
	 * @returns Promise<number> The total TVL in USD.
	 */
	async getProtocolTVL(): Promise<number> {
		try {
			const poolDetails = await this.agent.getPoolDetails('APT')
			return poolDetails.marketSize
		} catch (error) {
			logger.error('Error fetching Joule TVL', { error })
			return 0
		}
	}

	/**
	 * Fetches yield information for a specific token from Joule protocol.
	 * @param token - The token symbol to get yield info for.
	 * @returns Promise<YieldInfo> Detailed yield information including APY and TVL.
	 */
	async getYieldInfo(token: string): Promise<YieldInfo> {
		try {
			const poolDetails = await this.agent.getPoolDetails(token)

			return {
				protocol: 'Joule',
				token: token,
				apy: poolDetails.depositApy + (poolDetails.extraDepositApy || 0),
				tvl: poolDetails.marketSize,
				minDeposit: 0.1,
				maxDeposit: poolDetails.marketSize * 0.1,
				depositApy: poolDetails.depositApy,
				borrowApy: poolDetails.borrowApy,
				extraApy: poolDetails.extraDepositApy,
			}
		} catch (error) {
			logger.error('Error fetching Joule yield info', { error, token })
			throw error
		}
	}

	/**
	 * Deposits tokens into the Joule lending protocol.
	 * @param token - The token to deposit.
	 * @param amount - The amount to deposit.
	 * @returns Promise<string> Transaction hash of the deposit.
	 */
	async deposit(token: string, amount: number): Promise<string> {
		try {
			const result = await this.agent.lendToken(
				amount,
				token as `${string}::${string}::${string}`,
				'1234',
				true,
				false
			)

			return result.hash
		} catch (error) {
			logger.error('Error depositing to Joule', { error, token, amount })
			throw error
		}
	}
}
