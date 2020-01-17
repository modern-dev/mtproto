/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

import { WriteStream } from 'fs'; /* eslint-disable-line no-unused-vars */
import { IS_NODE_ENV } from './utils';

const DEFAULT_HISTORY_SIZE = 100;
const cachedLoggers: { [key: string]: Logger } = {};

export type LoggerOptions = {
  name: string;
  filePath?: string;
  level?: LoggerLevels;
  historySize?: number;
  historyOnly?: boolean;
}

/* eslint-disable no-unused-vars */
export enum LoggerLevels {
  Error,
  Warn,
  Info,
  Debug
}
/* eslint-enable no-unused-vars */

class Logger {
  static date(): string {
    const date = new Date();

    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }

  static time(): string {
    const date = new Date();

    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  public get history(): Array<string> {
    return this._history;
  }

  public level: LoggerLevels;
  public readonly name: string;
  public readonly filePath?: string;
  private readonly logTimer: number;
  private readonly historyOnly: boolean;
  private readonly historySize: number;
  private readonly _history: Array<string>;
  private fileWriteStream?: WriteStream;
  private consoleUtils = {
    [LoggerLevels.Error]: {
      fn: console.error,
      name: 'ERROR'
    },
    [LoggerLevels.Warn]: {
      fn: console.warn,
      name: 'WARN'
    },
    [LoggerLevels.Info]: {
      fn: console.info,
      name: 'INFO'
    },
    [LoggerLevels.Debug]: {
      fn: console.debug,
      name: 'DEBUG'
    }
  };

  constructor(options: LoggerOptions = { level: LoggerLevels.Info, name: 'Logger' }) {
    this.name = options.name;
    this.filePath = options.filePath;
    this.level = options.level || LoggerLevels.Info;
    this.logTimer = new Date().getTime();

    this._history = [];
    this.historyOnly = !!options.historyOnly;

    if (options.historySize && options.historySize > 0) {
      this.historySize = options.historySize;
    } else {
      this.historySize = DEFAULT_HISTORY_SIZE;
    }

    this.checkFilePath();
  }

  error(message: string, ...args: Array<any>) {
    this.log(LoggerLevels.Error, message, ...args);
  }

  warn(message: string, ...args: Array<any>) {
    this.log(LoggerLevels.Warn, message, ...args);
  }

  info(message: string, ...args: Array<any>) {
    this.log(LoggerLevels.Info, message, ...args);
  }

  debug(message: string, ...args: Array<any>) {
    this.log(LoggerLevels.Debug, message, ...args);
  }

  log(level: LoggerLevels, message: string, ...args: Array<any>) {
    this.logFn(level, message, ...args);
  }

  private logFn(level: LoggerLevels, message: string, ...args: Array<any>) {
    if (this.isLevelEnabled(level)) {
      const msg = this.format.call(this, message, ...args);
      const logLine = this.getMessage(msg, level);

      if (this.filePath && this.fileWriteStream) {
        this.fileWriteStream.write(logLine);
      } else {
        if (this.historyOnly) {
          if (this._history.length >= this.historySize) {
            this._history.shift();
          }

          this._history.push(logLine);
        } else {
          this.consoleUtils[this.level].fn.call(console, logLine);
        }
      }
    }
  }

  private checkFilePath() {
    if (IS_NODE_ENV && this.filePath) {
      const fs = require('fs');

      this.fileWriteStream = fs.createWriteStream(this.filePath, { flags: 'a' });
    }
  }

  private clmt(): string {
    return (((new Date()).getTime() - this.logTimer) / 1000).toFixed(3);
  }

  private isLevelEnabled(level: LoggerLevels): boolean {
    return level <= this.level;
  }

  private getMessage(msg: string, level: LoggerLevels): string {
    return `${Logger.date()} | ${Logger.time()} | ${this.clmt()} | ${this.consoleUtils[level].name} | ${this.name} - ${msg}`;
  }

  private format(fmt: string): string {
    const re: RegExp = /(%?)(%([jds]))/g,
      args: Array<any> = Array.prototype.slice.call(arguments, 1);

    if (args.length) {
      fmt = fmt.replace(re, (match, escaped, ptn, flag) => {
        let arg = args.shift();

        switch (flag) {
          case 's':
            arg = ''+ arg;
            break;

          case 'd':
            arg = Number(arg);
            break;

          case 'j':
            arg = JSON.stringify(arg);
            break;
        }

        if (!escaped) {
          return arg;
        }

        args.unshift(arg);

        return match;
      });
    }

    if (args.length) {
      fmt += ' ' + args.join(' ');
    }

    fmt = fmt.replace(/%{2,2}/g, '%');

    return '' + fmt;
  }
}

const getLogger = (nameOrOpts: LoggerOptions | string): Logger => {
  let opts: LoggerOptions;

  if (typeof nameOrOpts === 'string') {
    opts = {
      name: nameOrOpts
    };
  } else {
    opts = nameOrOpts;
  }

  if (opts.name in cachedLoggers) {
    return cachedLoggers[opts.name];
  }

  return (cachedLoggers[opts.name] = new Logger(opts));
};

export {
  DEFAULT_HISTORY_SIZE,
  Logger,
  getLogger
};
