import { YieldInfo, YieldStrategy } from './types'
import { JouleAgent, ThalaAgent, AmnisAgent, EchoAgent } from './agents'
import { TokenScanner } from './utils/token-scanner'
import { APYCalculator } from './utils/apy-calculator'
import { logger } from './utils/logger'
import { config } from './config'
import { AgentRuntime } from 'move-agent-kit'
import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage } from '@langchain/core/messages'

export class YieldFarmingAssistant {
	private jouleAgent: JouleAgent
	private thalaAgent: ThalaAgent
	private amnisAgent: AmnisAgent
	private echoAgent: EchoAgent
	private tokenScanner: TokenScanner
	private llm: ChatAnthropic

	constructor(private agent: AgentRuntime) {
		this.jouleAgent = new JouleAgent(agent)
		this.thalaAgent = new ThalaAgent(agent)
		this.amnisAgent = new AmnisAgent(agent)
		this.echoAgent = new EchoAgent(agent)
		this.tokenScanner = new TokenScanner(agent)

		this.llm = new ChatAnthropic({
			apiKey: config.anthropicKey,
			model: 'claude-3-sonnet-20240229',
		})
	}

	async analyzeYieldOpportunities(address: string): Promise<{
		strategies: YieldStrategy[]
		aiRecommendation: string
	}> {
		try {
			const balances = await this.tokenScanner.scanWallet(address)
			const strategies: YieldStrategy[] = []

			for (const balance of balances) {
				if (balance.balance <= 0) continue

				const yields: YieldInfo[] = await Promise.all([
					this.jouleAgent.getYieldInfo(balance.token),
					this.thalaAgent.getYieldInfo(balance.token),
					this.amnisAgent.getYieldInfo(balance.token),
					this.echoAgent.getYieldInfo(balance.token),
				])

				yields.sort((a, b) => b.apy - a.apy)
				const bestYield = yields[0]

				if (bestYield.apy > config.minYieldDifference) {
					strategies.push({
						protocol: bestYield.protocol,
						token: balance.token,
						amount: balance.balance,
						estimatedApy: bestYield.apy,
						estimatedYieldPerDay: APYCalculator.calculateDailyYield(balance.balance, bestYield.apy),
						risks: this.calculateRisks(bestYield),
						requirements: this.calculateRequirements(bestYield),
					})
				}
			}

			const aiRecommendation = await this.getAIRecommendation(strategies)

			return {
				strategies,
				aiRecommendation,
			}
		} catch (error) {
			logger.error('Error analyzing yield opportunities', { error })
			throw error
		}
	}

	private async getAIRecommendation(strategies: YieldStrategy[]): Promise<string> {
		try {
			const marketContext = await this.getMarketContext()
			const prompt = `As a DeFi yield farming expert, analyze these opportunities:

${JSON.stringify(strategies, null, 2)}

Current market context:
${marketContext}

Please provide:
1. Best strategy recommendation considering risk-adjusted returns
2. Detailed risk assessment for each strategy
3. Step-by-step implementation instructions
4. Market timing considerations
5. Gas cost considerations and break-even analysis

Focus on safety and sustainable yields rather than just highest APY.`

			const response = await this.llm.invoke([new HumanMessage(prompt)])
			return response.content as string
		} catch (error) {
			logger.error('Error getting AI recommendation', { error })
			return 'Unable to generate AI recommendation at this time.'
		}
	}

	private async getMarketContext(): Promise<string> {
		try {
			const aptPrice = await this.agent.getTokenPrice('0x1::aptos_coin::AptosCoin')
			const marketTVL = await this.getProtocolsTVL()

			return `
- APT Price: $${aptPrice}
- Total TVL: $${marketTVL}
- Market Conditions: ${await this.getMarketConditions()}
      `
		} catch (error) {
			return 'Market context unavailable'
		}
	}

	async executeStrategy(strategy: YieldStrategy): Promise<string> {
		try {
			switch (strategy.protocol) {
				case 'Joule':
					return await this.jouleAgent.deposit(strategy.token, strategy.amount)
				case 'Thala':
					return await this.thalaAgent.stake(strategy.amount)
				case 'Amnis':
					return await this.amnisAgent.stake(strategy.amount)
				case 'Echo':
					return await this.echoAgent.stake(strategy.amount)
				default:
					throw new Error(`Unsupported protocol: ${strategy.protocol}`)
			}
		} catch (error) {
			logger.error('Error executing strategy', { error, strategy })
			throw error
		}
	}

	private calculateRisks(yieldInfo: YieldInfo): string[] {
		const risks = ['Smart contract risk']

		if (yieldInfo.tvl < 1000000) {
			risks.push('Low TVL risk')
		}
		if (yieldInfo.apy > 50) {
			risks.push('High APY volatility risk')
		}

		return risks
	}

	private calculateRequirements(yieldInfo: YieldInfo): string[] {
		return [
			`Minimum deposit: ${yieldInfo.minDeposit} ${yieldInfo.token}`,
			`Maximum deposit: ${yieldInfo.maxDeposit} ${yieldInfo.token}`,
			`Gas fees required for deposit and withdrawal`,
		]
	}

	private async getProtocolsTVL(): Promise<number> {
		try {
			const tvls = await Promise.all([
				this.jouleAgent.getProtocolTVL(),
				this.thalaAgent.getProtocolTVL(),
				this.amnisAgent.getProtocolTVL(),
				this.echoAgent.getProtocolTVL(),
			])

			return tvls.reduce((acc, tvl) => acc + tvl, 0)
		} catch (error) {
			return 0
		}
	}

	private async getMarketConditions(): Promise<string> {
		// This could be expanded to include more sophisticated market analysis.
		return 'Normal market conditions'
	}
}
