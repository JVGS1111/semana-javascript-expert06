import fs from 'fs';
import config from './config.js';
import { join, extname } from 'path';
import fsPromises from 'fs/promises';
import { randomUUID } from 'crypto';
import { PassThrough, Writable } from 'stream';
import Throttle from 'throttle';
import childProcess from 'child_process';
import { logger } from './utils.js';
import streamsPromises from 'stream/promises'
import { once } from 'events';

const {
    dir: {
        publicDirectory
    },
    constants: {
        fallbackBitRate,
        englishConversation,
        bitRateDivisor
    }
} = config;

export class Service {
    constructor() {
        this.clientStreams = new Map();
        this.currentSong = englishConversation;
        this.currentBitRate = 0;
        this.throttleTransform = {};
        this.currentReadable = {};


    }

    createClientStream() {
        const id = randomUUID();
        const clientStream = new PassThrough();
        this.clientStreams.set(id, clientStream);

        return {
            id,
            clientStream
        }
    }

    stopStreamming() {
        this.throttleTransform?.end?.()
    }

    removeClientStream(id) {
        this.clientStreams.delete(id);
    }

    createFileStream(filename) {
        return fs.createReadStream(filename)
    }

    _executeSoxCommands(args) {
        return childProcess.spawn('sox', args)
    }

    broadCast() {
        return new Writable({
            write: (chunk, enc, cb) => {
                for (const [id, stream] of this.clientStreams) {
                    //se desconectou não mandar mais dados  
                    if (stream.WritableEnded) {
                        this.clientStreams.delete(id)
                        continue;
                    }
                    stream.write(chunk)
                }
                cb();
            }
        })
    }
    async startStreaming() {
        logger.info(`starting-with ${this.currentSong}`)
        const bitRate = this.currentBitRate = (await this.getBitRate(this.currentSong) / bitRateDivisor);
        const throttleTransform = this.throttleTransform = new Throttle(bitRate);
        const songReadable = this.currentReadable = this.createFileStream(this.currentSong);
        return streamsPromises.pipeline(
            songReadable,
            throttleTransform,
            this.broadCast()
        )
    }

    async getBitRate(song) {
        try {
            console.log(song);
            const args = ["--i", "-B", song];

            const { stderr, stdout } = this._executeSoxCommands(args);
            await Promise.all([once(stderr, "readable"), once(stdout, "readable")]);
            const [sucess, error] = [stdout, stderr].map((stream) => stream.read());
            if (error) return await Promise.reject(error);

            return sucess.toString().trim().replace("k", "000");
        } catch (error) {
            logger.error(`lascou no bitrate: ${error}`);
            return fallbackBitRate;
        }
    }

    async getFileInfo(file) {
        // file = home/index.html
        const fullFilePath = join(publicDirectory, file);
        //valida se existe, se não existe estourar erro!!
        await fsPromises.access(fullFilePath);
        const fileType = extname(fullFilePath);

        return {
            type: fileType,
            name: fullFilePath
        }
    }

    async getFileStream(file) {
        const {
            name,
            type
        } = await this.getFileInfo(file);
        return {
            stream: this.createFileStream(name),
            type
        }
    }


}