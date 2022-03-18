import pino from 'pino';


const log = pino({
    enable: !(!!process.env.LOG_DISABLED),
    transport: {
        target: 'pino-pretty',
        options: {
            colorized: true
        }
    }
})


export const logger = log;