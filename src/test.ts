import { Aptos, AptosConfig, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk'
import { AgentRuntime, LocalSigner } from 'move-agent-kit'
import { YieldFarmingAssistant } from './index'
import { config } from './config'

async function main() {
	const aptosConfig = new AptosConfig({ network: config.network })
	const aptos = new Aptos(aptosConfig)

	const account = aptos.deriveAccountFromPrivateKey({
		privateKey: new Ed25519PrivateKey(config.privateKey),
	})

	const signer = new LocalSigner(await account, config.network)
	const agent = new AgentRuntime(signer, aptos)

	const assistant = new YieldFarmingAssistant(agent)

	// Test with our wallet address.
	const result = await assistant.analyzeYieldOpportunities(
		(await account).accountAddress.toString()
	)

	console.log('=== Yield Opportunities ===')
	console.log(JSON.stringify(result.strategies, null, 2))

	console.log('\n=== AI Recommendation ===')
	console.log(result.aiRecommendation)
}

main().catch(console.error)
