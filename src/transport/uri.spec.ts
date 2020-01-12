/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

import { buildURI } from './uri';
import { expect } from 'chai';
import 'mocha';

describe('transport/uri.ts', () => {
  describe('buildServerUrl', () => {
    it('should not allow passing empty options object or empty dcId', () => {
      expect(() => buildURI({ dcId: -2 })).to.throw('dcId cannot be null or empty.');
    });

    it('should build server url with default options and dcID of 1 successfully', () => {
      const serverUrl = buildURI({ dcId: 1 });
      const expectedServerUrl = 'http://149.154.175.50:80/api1';

      expect(serverUrl).not.to.be.null;
      expect(serverUrl).to.be.equals(expectedServerUrl);
    });

    it('should build server url with TLS, CORS headers and WebSockets enabled successfully', () => {
      const serverUrl = buildURI({
        dcId: 3,
        useTLS: true,
        enableWebSockets: true,
        enableCORS: true
      });
      const expectedServerUrl = 'https://aurora.web.telegram.org:443/apiws1';

      expect(serverUrl).not.to.be.null;
      expect(serverUrl).to.be.equals(expectedServerUrl);
    });

    it('should build test server url with TLS and CORS headers enabled, supporting ' +
      'the maximum limit of simultaneous requests per hostname', () => {
      const serverUrl = buildURI({
        dcId: 5,
        useTLS: true,
        enableCORS: true,
        test: true,
        multiRequest: true
      });
      const expectedServerUrl = 'https://flora-1.web.telegram.org:443/apiw_test1';

      expect(serverUrl).not.to.be.null;
      expect(serverUrl).to.be.equals(expectedServerUrl);
    });
  });
});
