export interface YieldInfo {
	protocol: string
	token: string
	apy: number
	tvl: number
	minDeposit: number
	maxDeposit: number
	depositApy?: number
	borrowApy?: number
	extraApy?: number
}

export interface TokenBalance {
	token: string
	balance: number
	decimals: number
	usdValue: number
}

export interface YieldStrategy {
	protocol: string
	token: string
	amount: number
	estimatedApy: number
	estimatedYieldPerDay: number
	risks: string[]
	requirements: string[]
}
