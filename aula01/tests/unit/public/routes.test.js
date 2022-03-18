import {
    jest,
    expect,
    describe,
    test,
    beforeEach
} from '@jest/globals';
import config from '../../../server/config.js';
import { Controller } from '../../../server/controller.js';
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js'

const { pages, location, constants } = config;
describe("#routes - test site for api response", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    })

    test('GET / - should redirect to home page', async () => {
        const params = TestUtil.defaultHandleParams();
        params.request.method = 'GET';
        params.request.url = "/";

        await handler(...params.values())
        expect(params.response.writeHead).toBeCalledWith(
            302,
            {
                'Location': location.home
            }
        )
        expect(params.response.end).toHaveBeenCalled()
    })

})