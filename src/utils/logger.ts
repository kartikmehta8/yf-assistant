import winston from 'winston'
import { config } from '../config'

/**
 * Application-wide logger configuration using Winston.
 * Provides structured logging with timestamps and multiple transports.
 *
 * Features:
 * - Console output with colors.
 * - Error logging to separate file.
 * - Combined logging for all levels.
 * - JSON formatting for file outputs.
 * - Configurable log level from environment.
 */
export const logger = winston.createLogger({
	// Set log level from config (default: 'info').
	level: config.logLevel,

	// Define base format with timestamp and JSON structure.
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),

	// Configure multiple logging transports.
	transports: [
		/**
		 * Console Transport.
		 * - Colorized output.
		 * - Simple format for readability.
		 */
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
		}),

		/**
		 * Error Log File Transport.
		 * - Captures only error level logs.
		 * - Writes to 'error.log'.
		 */
		new winston.transports.File({
			filename: 'error.log',
			level: 'error',
		}),

		/**
		 * Combined Log File Transport.
		 * - Captures all log levels.
		 * - Writes to 'combined.log'.
		 */
		new winston.transports.File({
			filename: 'combined.log',
		}),
	],
})
