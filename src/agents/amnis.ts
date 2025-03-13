import { AgentRuntime } from 'move-agent-kit'
import { YieldInfo } from '../types'
import { logger } from '../utils/logger'
import { convertAmountFromHumanReadableToOnChain } from '@aptos-labs/ts-sdk'

/**
 * AmnisAgent handles interactions with the Amnis Finance protocol.
 */
export class AmnisAgent {
	constructor(private agent: AgentRuntime) {}

	/**
	 * Fetches the total value locked (TVL) in the Amnis protocol.
	 * @returns Promise<number> The total TVL in USD.
	 */
	async getProtocolTVL(): Promise<number> {
		try {
			const response = await fetch('https://api.amnis.finance/v1/staking/stats')
			const data = await response.json()
			return data.totalStaked || 0
		} catch (error) {
			logger.error('Error fetching Amnis TVL', { error })
			return 0
		}
	}

	/**
	 * Retrieves yield information for a specific token from Amnis.
	 * @param token - The token symbol to get yield info for.
	 * @returns Promise<YieldInfo> Detailed yield information.
	 */
	async getYieldInfo(token: string): Promise<YieldInfo> {
		try {
			const response = await fetch('https://api.amnis.finance/v1/staking/stats')
			const data = await response.json()

			return {
				protocol: 'Amnis',
				token: 'APT',
				apy: data.stakingApy,
				tvl: data.totalStaked,
				minDeposit: 0.1,
				maxDeposit: data.totalStaked * 0.1, // 10% of TVL as safety limit.
				depositApy: data.stakingApy,
				extraApy: data.extraRewardsApy || 0,
			}
		} catch (error) {
			logger.error('Error fetching Amnis yield info', { error, token })
			throw error
		}
	}

	/**
	 * Stakes tokens in the Amnis protocol.
	 * @param amount - The amount of tokens to stake.
	 * @returns Promise<string> Transaction hash of the stake operation.
	 */
	async stake(amount: number): Promise<string> {
		try {
			const txHash = await this.agent.stakeTokensWithAmnis(
				this.agent.account.getAddress(),
				convertAmountFromHumanReadableToOnChain(amount, 8)
			)

			logger.info('Successfully staked in Amnis', { amount, txHash })
			return txHash
		} catch (error) {
			logger.error('Error staking in Amnis', { error, amount })
			throw error
		}
	}

	/**
	 * Unstakes tokens from the Amnis protocol.
	 * @param amount - The amount of tokens to unstake.
	 * @returns Promise<string> Transaction hash of the unstake operation.
	 */
	async unstake(amount: number): Promise<string> {
		try {
			const txHash = await this.agent.withdrawStakeFromAmnis(
				this.agent.account.getAddress(),
				convertAmountFromHumanReadableToOnChain(amount, 8)
			)

			logger.info('Successfully unstaked from Amnis', { amount, txHash })
			return txHash
		} catch (error) {
			logger.error('Error unstaking from Amnis', { error, amount })
			throw error
		}
	}
}
