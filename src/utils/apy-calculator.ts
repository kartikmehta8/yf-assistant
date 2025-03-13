/**
 * Utility class for calculating yields and APY-related metrics.
 * Provides methods for daily yield, compounded returns, and break-even analysis.
 */
export class APYCalculator {
	/**
	 * Calculates the daily yield based on amount and APY.
	 * @param amount - The principal amount invested.
	 * @param apy - Annual Percentage Yield (as a decimal, e.g., 0.05 for 5% APY).
	 * @returns number - The expected daily yield.
	 */
	static calculateDailyYield(amount: number, apy: number): number {
		return (amount * apy) / 365
	}

	/**
	 * Calculates the total yield with compound interest over a period.
	 * @param principal - The initial investment amount.
	 * @param apy - Annual Percentage Yield (as a decimal).
	 * @param days - Number of days to compound.
	 * @returns number - The total yield earned (excluding principal).
	 */
	static calculateCompoundedYield(principal: number, apy: number, days: number): number {
		const periodsPerYear = 365
		const periods = days
		const rate = apy / periodsPerYear

		return principal * Math.pow(1 + rate, periods) - principal
	}

	/**
	 * Calculates the number of days needed to break even considering gas fees.
	 * @param amount - The investment amount.
	 * @param apy - Annual Percentage Yield (as a decimal).
	 * @param gasFees - The total gas fees paid for deposit/withdrawal.
	 * @returns number - Number of days needed to break even.
	 */
	static calculateBreakEvenPeriod(amount: number, apy: number, gasFees: number): number {
		const dailyYield = this.calculateDailyYield(amount, apy)
		return Math.ceil(gasFees / dailyYield)
	}
}
