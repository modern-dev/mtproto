/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

import { post } from './requests';
import { expect } from 'chai';
import wretch from 'wretch';
import 'mocha';

describe('core/requests.ts', () => {
  const url = 'http://localhost:9654/test_array_buffer';

  before(() => {
    wretch().polyfills({
      fetch: require('node-fetch'),
      FormData: require('form-data'),
      URLSearchParams: require('url').URLSearchParams
    })
  });

  it('should perform POST request with content type of arrayBuffer successfully', async () => {
    const expectedResult = [0x00, 0x01, 0x02, 0x03];
    const actualResult = await post(url);

    expect(actualResult).to.be.an.instanceof(ArrayBuffer)
      .and.have.property('byteLength', expectedResult.length);

    expect([...new Uint8Array(actualResult)]).to.have.members(expectedResult);
  });
});
