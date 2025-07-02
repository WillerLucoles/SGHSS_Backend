// src/utils/logger.js
import { createLogger, format, transports } from 'winston';


const level = process.env.LOG_LEVEL || 'info';
const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),

    ...(isProd
      ? [new transports.File({ filename: 'logs/error.log', level: 'error' })]
      : []),
  ],
});


export default logger;