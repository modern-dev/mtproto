/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

const selectedServers: { [key: number]: string } = {};
const sslSubdomains = ['pluto', 'venus', 'aurora', 'vesta', 'flora'];
const knownDcs = [{ id: 1, host: '149.154.175.50' },
  { id: 2, host: '149.154.167.51' },
  { id: 3, host: '149.154.175.100' },
  { id: 4, host: '149.154.167.91' },
  { id: 5, host: '149.154.171.5' }];
const knownTestDcs = [
  { id: 1, host: '149.154.175.10' },
  { id: 2, host: '149.154.167.40' },
  { id: 3, host: '149.154.175.117' }];

type URIOptions = {
  /**
   * True, if CORS headers are required in order to connect from a browser.
   */
  enableCORS?: boolean;
  useTLS?: boolean;
  dcId: number;
  test?: boolean;
  multiRequest?: boolean;
  enableWebSockets?: boolean;
};

function buildServerUrl(host: string, options: URIOptions) {
  let url = 'http';

  if (options.useTLS) {
    url += 's';
  }

  url += '://' + host + ':';

  if (options.useTLS) {
    url += '443';
  } else {
    url += '80';
  }

  url += '/api';

  if (options.enableCORS) {
    url += 'w';
  }

  if (options.enableWebSockets) {
    url += 's';
  }

  if (options.test) {
    url += '_test';
  }

  url += '1';

  return url;
}

export const buildURI = (options: URIOptions = { dcId: 1 }): string => {
  if (!options) {
    throw new ReferenceError('options cannot be null or empty.');
  }

  if (!options.dcId || options.dcId < 0) {
    throw new ReferenceError('dcId cannot be null or empty.');
  }

  if (!selectedServers[options.dcId]) {
    let selectedServer: string = '';

    if (options.useTLS) {
      let host = sslSubdomains[options.dcId - 1];

      if (options.multiRequest) {
        host += '-1';
      }

      host += '.web.telegram.org';
      selectedServer = buildServerUrl(host, options);

      return selectedServer;
    }

    const knownServers = options.test ? knownTestDcs : knownDcs;

    for (let i = 0; i < knownServers.length; i++) {
      let dc = knownDcs[i];

      if (dc.id === options.dcId) {
        selectedServer = buildServerUrl(dc.host, options);

        break;
      }
    }

    selectedServers[options.dcId] = selectedServer;
  }

  return selectedServers[options.dcId];
};
