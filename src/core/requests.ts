/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

import wretch from 'wretch';

type RequestBody = Document | BodyInit | null;

const post = (url: string, data?: RequestBody): Promise<ArrayBuffer> =>
  wretch(url).post(data).arrayBuffer();

export {
  post
};
