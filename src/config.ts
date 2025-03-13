import dotenv from 'dotenv'
import { Network } from '@aptos-labs/ts-sdk'

dotenv.config()

export const config = {
	network:
		(process.env.NETWORK || 'mainnet').toLowerCase() === 'mainnet'
			? Network.MAINNET
			: Network.TESTNET,
	privateKey: process.env.APTOS_PRIVATE_KEY || '',
	anthropicKey: process.env.ANTHROPIC_API_KEY || '',
	logLevel: process.env.LOG_LEVEL || 'info',
	minYieldDifference: 0.5, // Minimum APY difference to recommend switching.
	maxSlippage: 0.5, // Maximum allowed slippage percentage.
	gasBuffer: 1.2, // Buffer for gas estimation.
}
