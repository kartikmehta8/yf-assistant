// POC for ECHO protocol integration.
// This agent provides functionality for interacting with the Echo protocol.
// It can fetch yield information, stake, and unstake tokens in the protocol.

import { AgentRuntime } from 'move-agent-kit'
import { YieldInfo } from '../types'
import { logger } from '../utils/logger'
import { convertAmountFromHumanReadableToOnChain } from '@aptos-labs/ts-sdk'

/**
 * EchoAgent handles interactions with the Echo Finance protocol.
 * Provides functionality for staking, unstaking, and fetching yield information.
 */
export class EchoAgent {
	constructor(private agent: AgentRuntime) {}

	/**
	 * Retrieves the total value locked (TVL) in the Echo protocol.
	 * @returns Promise<number> The total TVL in USD.
	 */
	async getProtocolTVL(): Promise<number> {
		try {
			const response = await fetch('ECHO ENDPOINT')
			const data = await response.json()
			return data.totalTVL || 0
		} catch (error) {
			logger.error('Error fetching Echo TVL', { error })
			return 0
		}
	}

	/**
	 * Fetches yield information for a specific token from Echo protocol.
	 * @param token - The token symbol to get yield info for.
	 * @returns Promise<YieldInfo> Detailed yield information including APY and TVL.
	 * @throws Error if pool not found for the specified token.
	 */
	async getYieldInfo(token: string): Promise<YieldInfo> {
		try {
			const response = await fetch('ECHO ENDPOINT')
			const data = await response.json()

			const poolInfo = data.pools.find((p: any) => p.token === token)
			if (!poolInfo) {
				throw new Error(`Pool not found for token ${token}`)
			}

			return {
				protocol: 'Echo',
				token: token,
				apy: poolInfo.apy,
				tvl: poolInfo.tvl,
				minDeposit: 0.1,
				maxDeposit: poolInfo.tvl * 0.1, // 10% of TVL as safety limit.
				depositApy: poolInfo.baseApy,
				extraApy: poolInfo.bonusApy || 0,
			}
		} catch (error) {
			logger.error('Error fetching Echo yield info', { error, token })
			throw error
		}
	}

	/**
	 * Stakes tokens in the Echo protocol.
	 * @param amount - The amount of tokens to stake (in human readable format).
	 * @returns Promise<string> Transaction hash of the stake operation.
	 */
	async stake(amount: number): Promise<string> {
		try {
			const txHash = await this.agent.stakeTokenWithEcho(
				convertAmountFromHumanReadableToOnChain(amount, 8)
			)

			logger.info('Successfully staked in Echo', { amount, txHash })
			return txHash
		} catch (error) {
			logger.error('Error staking in Echo', { error, amount })
			throw error
		}
	}

	/**
	 * Unstakes tokens from the Echo protocol.
	 * @param amount - The amount of tokens to unstake (in human readable format).
	 * @returns Promise<string> Transaction hash of the unstake operation.
	 */
	async unstake(amount: number): Promise<string> {
		try {
			const txHash = await this.agent.unstakeTokenWithEcho(
				convertAmountFromHumanReadableToOnChain(amount, 8)
			)

			logger.info('Successfully unstaked from Echo', { amount, txHash })
			return txHash
		} catch (error) {
			logger.error('Error unstaking from Echo', { error, amount })
			throw error
		}
	}
}
