/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

import { getLogger, LoggerLevels } from './logger';
import { expect } from 'chai';
import 'mocha';

describe('core/logger', () => {
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalError = console.error;
  const originalDebug = console.debug;
  let consoleOutput: Array<string> = [];
  const mockedLog = (logLine: string) => {
    consoleOutput.push(logLine);
  };

  beforeEach(() => {
    console.warn = mockedLog;
    console.info = mockedLog;
    console.error = mockedLog;
    console.debug = mockedLog;
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.info = originalInfo;
    console.error = originalError;
    console.debug = originalDebug;
    consoleOutput = [];
  });

  it('should use history when enabled', () => {
    const logger = getLogger({
      name: 'mtproto-logger1',
      historyOnly: true,
      historySize: 10
    });

    logger.warn('foo bar');
    logger.error('foo baz');

    expect(logger.history).to.be.an('array').that.have.lengthOf(2);
    expect(logger.history[0].endsWith('foo bar')).to.be.true;
  });

  it('should obey log level settings', () => {
    const logger = getLogger({
      name: 'mtproto-logger1',
      historyOnly: true,
      historySize: 10,
      level: LoggerLevels.Warn
    });

    logger.warn('foo bar');
    logger.error('foo baz');
    logger.info('foo qux');

    expect(logger.history).to.be.an('array').that.have.lengthOf(2);
    expect(logger.history[0].endsWith('foo bar')).to.be.true;
    expect(logger.history[1].endsWith('foo baz')).to.be.true;
  });

  it('should print message message to the console', () => {
    const logger = getLogger('mtproto-logger1');

    logger.error('foo bar');
    logger.warn('foo baz');

    expect(consoleOutput).to.have.lengthOf(2);
    expect(consoleOutput[0].endsWith('foo bar')).to.be.true;
    expect(consoleOutput[1].endsWith('foo baz')).to.be.true;
  });

  it('should use different log level function properly', () => {
    const logger = getLogger({
      name: 'mtproto-logger1',
      level: LoggerLevels.Debug
    });

    logger.error('foo bar');
    logger.warn('foo baz');
    logger.info('foo qux');
    logger.debug('foo quux');

    expect(consoleOutput).to.have.lengthOf(4);
    expect(consoleOutput[0].includes('ERROR')).to.be.true;
    expect(consoleOutput[1].includes('WARN')).to.be.true;
    expect(consoleOutput[2].includes('INFO')).to.be.true;
    expect(consoleOutput[3].includes('DEBUG')).to.be.true;
  });
});
