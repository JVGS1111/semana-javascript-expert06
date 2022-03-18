import {
    jest,
    expect,
    describe,
    test,
    beforeEach
} from '@jest/globals';
import config from '../../../server/config.js';
import { Controller } from '../../../server/controller.js';
import TestUtil from '../_util/testUtil.js'
const { pages, location, constants } = config;
import { Service } from '../../../server/service.js'

describe('#Controller', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    })
    test('function getFileStream should be return file stream', async () => {
        const mockFileStream = TestUtil.generateReadableStream(['data']);
        const controller = new Controller();
        const expectedType = '.html';

        jest.spyOn(
            Service.prototype,
            Service.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType,
        })
        const result = await controller.getFileStream(pages.homeHTML)

        expect(Service.prototype.getFileStream).toBeCalledWith(pages.homeHTML);
        expect(result).toStrictEqual({
            stream: mockFileStream,
            type: expectedType,
        });
    })
})