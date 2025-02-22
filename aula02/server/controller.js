import { Service } from './service.js';
import { logger } from './utils.js';

export class Controller {
    constructor() {
        this.service = new Service()
    }

    async getFileStream(filename) {
        return this.service.getFileStream((filename));
    }

    createClientStream() {
        const { id, clientStream } = this.service.createClientStream();

        const onClose = () => {
            logger.info(`Closing connection of ${id}`);
            this.service.removeClientStream(id);
        };

        return {
            stream: clientStream,
            onClose,
        };
    }

    async handleCommand({ command }) {
        logger.info(`command recived: ${command}`);

        const result = {
            result: 'ok'
        }

        const cmd = command.toLowerCase();
        if (cmd.includes('start')) {
            this.service.startStreaming()
            return result
        }
        if (cmd.includes('stop')) {
            this.service.stopStreamming();
            return result
        }
        return this.service.startStreaming();
    }
}