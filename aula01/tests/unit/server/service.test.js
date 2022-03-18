import {
    jest,
    expect,
    describe,
    test,
    beforeEach
} from '@jest/globals';
import { Service } from '../../../server/service.js';
import TestUtil from '../_util/testUtil.js'
import config from '../../../server/config.js';
import fs from 'fs';
const { pages, dir: { publicDirectory } } = config;

import fsPromises from 'fs/promises';
import { extname } from 'path';
describe('#Service', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    })

    test('method createFileStream should be return fs read stream', () => {
        const mockFileStream = TestUtil.generateReadableStream(['data']);
        const service = new Service();
        const filename = '/index.html';


        const createFileStream = jest.spyOn(
            fs,
            "createReadStream"
        ).mockReturnValue(
            mockFileStream
        )

        const result = service.createFileStream(filename);

        expect(createFileStream).toBeCalledWith(filename);
        expect(result).toStrictEqual(mockFileStream);

    })

    test('method getFileInfo should be return file data', async () => {
        const file = '/index.html';

        const service = new Service();
        const expectedType = '.html';
        const fullname = publicDirectory + file;
        jest.spyOn(
            fsPromises,
            fsPromises.access.name
        ).mockResolvedValue(
            fullname
        )

        const result = await service.getFileInfo(file);
        expect(result).toStrictEqual({
            type: expectedType,
            name: fullname
        })
    })

    test('method getFileStream should be return a stream', async () => {
        const file = '/home/index.html';
        const mockFileStream = TestUtil.generateReadableStream(['data']);
        const service = new Service();
        const expectedType = '.html';

        jest.spyOn(
            Service.prototype,
            Service.prototype.createFileStream.name
        ).mockReturnValue(
            mockFileStream
        )
        const result = await service.getFileStream(file);

        expect(result).toStrictEqual({
            stream: mockFileStream,
            type: expectedType
        })
    })
})