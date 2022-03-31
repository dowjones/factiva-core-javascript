/**
 *  @module factiva/core/FactivaLogger
 */
import { LOGS_DEFAULT_FOLDER, LOGGER_LEVELS } from './constants';
import { join, basename } from 'path';
import { createSimpleLogger } from 'simple-node-logger';
import { existsSync, mkdirSync } from 'fs';

const { INFO, DEBUG, WARN, ERROR } = LOGGER_LEVELS;
/** Class used to log data into a file */
class FactivaLogger {
  /**
   * Constructor
   * @param {string} filename - Filename where is he function/method to log
   */
  constructor(filename = __filename) {
    this.functionFileName = basename(filename);

    if (!existsSync(LOGS_DEFAULT_FOLDER)) {
      mkdirSync(LOGS_DEFAULT_FOLDER);
    }

    const logFileName = join(
      LOGS_DEFAULT_FOLDER,
      `factiva-${this.getLogDateFormat()}.log`,
    );

    this.logger = createSimpleLogger({
      logFilePath: logFileName,
      timestampFormat: 'YYYY-MM-DD HH:mm:ss,SSS',
      level: 'debug',
    });
  }

  getLogDateFormat() {
    const date = new Date();
    const _month = date.getMonth() + 1;
    return `${this.fmtShortDate(date.getDate())}-${this.fmtShortDate(
      _month,
    )}-${date.getFullYear()}`;
  }

  fmtShortDate(dateNum) {
    return dateNum < 10 ? `0${dateNum}` : dateNum;
  }

  /**
   * Create log registry
   * @param {('DEBUG'|'INFO'|'WARN'|'ERROR')} level - Log Level
   * @param {string} message - Message to log
   */
  log(level, message) {
    switch (level) {
      case INFO:
        this.logger.info(`${this.functionFileName} `, message);
        break;
      case DEBUG:
        this.logger.debug(`${this.functionFileName} `, message);
        break;
      case WARN:
        this.logger.warn(`${this.functionFileName} `, message);
        break;
      case ERROR:
        this.logger.error(`${this.functionFileName} `, message);
        break;
    }
  }
}
module.exports = FactivaLogger;
