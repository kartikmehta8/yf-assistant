import { AgentRuntime } from 'move-agent-kit'
import { YieldInfo } from '../types'
import { logger } from '../utils/logger'
import { convertAmountFromHumanReadableToOnChain } from '@aptos-labs/ts-sdk'

/**
 * ThalaAgent handles interactions with the Thala protocol.
 * Provides staking and liquidity provision functionality.
 */
export class ThalaAgent {
	constructor(private agent: AgentRuntime) {}

	/**
	 * Retrieves the total value locked (TVL) in the Thala protocol.
	 * @returns Promise<number> The total TVL in USD.
	 */
	async getProtocolTVL(): Promise<number> {
		try {
			const response = await fetch('https://app.thala.fi/stats')
			const data = await response.json()
			return data.totalTVL || 0
		} catch (error) {
			logger.error('Error fetching Thala TVL', { error })
			return 0
		}
	}

	/**
	 * Fetches yield information for a specific token from Thala protocol.
	 * @param token - The token symbol to get yield info for.
	 * @returns Promise<YieldInfo> Detailed yield information including APY and TVL.
	 * @throws Error if pool not found for the specified token.
	 */
	async getYieldInfo(token: string): Promise<YieldInfo> {
		try {
			const response = await fetch('https://app.thala.fi/stats')
			const data = await response.json()

			const poolInfo = data.pools.find((p: any) => p.token === token)
			if (!poolInfo) {
				throw new Error(`Pool not found for token ${token}`)
			}

			return {
				protocol: 'Thala',
				token: token,
				apy: poolInfo.stakingApy,
				tvl: poolInfo.tvl,
				minDeposit: 0.1,
				maxDeposit: poolInfo.tvl * 0.1, // 10% of TVL as safety limit.
				depositApy: poolInfo.stakingApy,
				extraApy: poolInfo.extraRewardsApy || 0,
			}
		} catch (error) {
			logger.error('Error fetching Thala yield info', { error, token })
			throw error
		}
	}

	/**
	 * Stakes tokens in the Thala protocol.
	 * @param amount - The amount of tokens to stake (in human readable format).
	 * @returns Promise<string> Transaction hash of the stake operation.
	 */
	async stake(amount: number): Promise<string> {
		try {
			const txHash = await this.agent.stakeTokensWithThala(
				convertAmountFromHumanReadableToOnChain(amount, 8)
			)

			logger.info('Successfully staked in Thala', { amount, txHash })
			return txHash
		} catch (error) {
			logger.error('Error staking in Thala', { error, amount })
			throw error
		}
	}

	/**
	 * Unstakes tokens from the Thala protocol.
	 * @param amount - The amount of tokens to unstake (in human readable format).
	 * @returns Promise<string> Transaction hash of the unstake operation.
	 */
	async unstake(amount: number): Promise<string> {
		try {
			const txHash = await this.agent.unstakeTokensWithThala(
				convertAmountFromHumanReadableToOnChain(amount, 8)
			)

			logger.info('Successfully unstaked from Thala', { amount, txHash })
			return txHash
		} catch (error) {
			logger.error('Error unstaking from Thala', { error, amount })
			throw error
		}
	}
}
