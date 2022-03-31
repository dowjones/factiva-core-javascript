/**
 * @module factiva/helper
 */

import axios from 'axios';
import config from 'config';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import FactivaLogger from '../core/FactivaLogger';

import createError from 'http-errors';
import {
  REQUEST_DEFAULT_TYPE,
  REQUEST_STREAM_TYPE,
  API_EXTRACTION_FILE_FORMATS,
  TIMESTAMP_FIELDS,
  MULTIVALUE_FIELDS_SPACE,
  MULTIVALUE_FIELDS_COMMA,
  LOGGER_LEVELS,
} from '../core/constants';
const { INFO, DEBUG, WARN, ERROR } = LOGGER_LEVELS;

/**
 * Object to be used by axios if proxy request is need
 * @typedef {Object} RequestOptions
 * @type {object}
 * @property {string} method - Method to use
 * @property {string} endpointUrl - Url to send a request
 * @property {string|object} [payload] - Payload request
 * @property {string} [headers] - Headers to be set
 * @property {string} [qsParams] - Params request
 * @property {string} [responseType=json] - Specify the type of response expected. Use 'stream' for big files
 * @property {string} [fileName=./tmp.csv] - Specify file name if responseType is stream
 */

/**
 * Object to be used by axios if proxy request is need
 * @typedef {Object} ProxyConfiguration
 * @type {object}
 * @property {string} protocol - Protocol to use
 * @property {string} host - Host of the server
 * @property {string} port - Port of the server
 * @property {AuthProxy} [auth] - Port of the server
 */

/**
 * ProxyConfiguration credentials
 * @typedef {Object} AuthProxy
 * @type {object}
 * @property {string} username - Username
 * @property {string} password - Password
 */

/**
 * Find the value of a environment variable
 * @param {string} configKey - Name of the environment variables to find
 * @returns {any} Value of the environment variables
 * @throws {ReferenceError} If the configKey not exist on the environment variables
 */

const logger = new FactivaLogger('/helper.js');

const loadEnvVariable = (configKey) => {
  logger.log(DEBUG, `Loading environment variable: ${configKey}`);
  const tmpVal = config[configKey];
  if (!tmpVal) {
    const errorMsg = `Environment Variable ${configKey} not found!`;
    logger.log(ERROR, errorMsg);
    throw ReferenceError(errorMsg);
  }

  return tmpVal;
};

/**
 * Find the value of an environment variable, if not exist return a default value
 * @param {string} envVarName - Name to environment variablñe to find
 * @param {any} defaultValue - Default value
 * @returns {any} Value of the environment variables
 */
const loadDefaultEnvVariable = (envVarName, defaultValue) => {
  try {
    return loadEnvVariable(envVarName);
  } catch (e) {
    logger.log(
      WARN,
      `Default environment variable ${envVarName}=${defaultValue}`,
    );
    return defaultValue;
  }
};

/**
 * Validate a given variable.
 * @param {any} varToValidate - Variable to be validate
 * @param {any} expectedType - Type to variable expected
 * @param {string} errorMessage - Message to be show if is invalid
 * @returns {ReferenceError} Error if the variable is not the type given
 */
const validateType = (varToValidate, expectedType, errorMessage) => {
  switch (expectedType) {
    case 'array':
      if (!Array.isArray(varToValidate)) throw ReferenceError(errorMessage);
      break;
    case 'object':
      if (!(varToValidate instanceof Object)) {
        throw ReferenceError(errorMessage);
      }
      break;
    default:
      if (typeof varToValidate !== expectedType) {
        throw ReferenceError(errorMessage);
      }
      break;
  }

  return SyntaxError('Type not identified');
};

/**
 * Validates that a given options is  part of the valid options.
 * @param {(string|number)} option - Variable to be validate
 * @param {(string[]|number[])} validOptions - Type to variable expected
 * @returns {(string|number)} Option to be validate
 * @throws {RangeError} - when the given option is not part of the valid
 */
const validateOption = (option, validOptions) => {
  if (!validOptions.includes(option.trim())) {
    const msg = `Option value ${option} is not within the allowed options: ${validOptions}`;
    logger.log(ERROR, msg);
    throw new RangeError(msg);
  }
  return option;
};

/**
 * Masks a string
 * @example
 * // return  ########ijkl
 * helper.maskWord('abcdefghijkl')
 * @param {string} wordToMask - String to be masked
 * @param {number} [rightPadding=4] - Number of characters to be avoided to mask
 * @returns {string} String masked
 */
const maskWord = (wordToMask, rightPadding = 4) => {
  if (wordToMask.length <= 4) {
    return wordToMask;
  }
  const masked = wordToMask
    .substring(0, wordToMask.length - rightPadding)
    .replace(/[a-z\d]/gi, '#');
  const unmasked = wordToMask.substring(
    wordToMask.length - rightPadding,
    wordToMask.length,
  );
  return masked + unmasked;
};

/**
 * Send a http-request error
 * @param {AxiosError} err - Axios error object
 * @throws {HttpError} Http error response
 */
const handleError = (err) => {
  let msg = '';
  if (err.response.status === 403) {
    msg = 'Factiva API-Key does not exist or inactive.';
    logger.log(WARN, msg);
    throw createError(403, msg);
  }

  if (err.response.data.errors) {
    const errors = err.response.data.errors
      .map((error) => `${error.title}: ${error.detail}`)
      .join();
    msg = `Unexpected API Error with message: ${err.response.statusText}: ${errors}`;
    logger.log(WARN, msg);
    throw createError(err.response.status, msg);
  }
  msg = `Unexpected API Error with message: ${err.response.statusText}.`;
  logger.log(WARN, msg);
  throw createError(err.response.status, msg);
};

/**
 * Return the proxy configuration object
 * @returns {ProxyConfiguration|null} Return a ProxyConfiguration object if is enabled, null otherwise.
 */
const getProxyConfiguration = () => {
  let options = null;
  try {
    const {
      use = false,
      protocol = '',
      host = '',
      port = '',
      auth = {},
    } = loadEnvVariable('proxy');
    if (use) {
      options = { protocol, host, port };
      if (
        Object.keys(auth).includes('username') &&
        Object.keys(auth).includes('password')
      ) {
        options = { ...options, auth };
      }
    }
  } catch (e) {}
  return options;
};

/**
 * Send a request to specific URL
 * @param {RequestOptions} options - Request option
 * @returns {Promise<object>} Request response
 */
const sendRequest = async ({
  method,
  endpointUrl,
  payload,
  headers,
  qsParams,
  responseType = REQUEST_DEFAULT_TYPE,
  fileName = './tmp.csv',
}) => {
  if (method === 'GET' && qsParams && typeof qsParams !== 'object') {
    logger.log(ERROR, 'Unexpected qsParams value');
    throw ReferenceError('Unexpected qsParams value');
  }

  let data;
  if (method === 'POST' && payload) {
    if (typeof payload === 'object') {
      data = payload;
    } else if (typeof payload === 'string') {
      data = JSON.parse(payload);
    } else {
      logger.log(ERROR, 'Unexpected payload value');
      throw Error('Unexpected payload value');
    }
  }
  const proxy = getProxyConfiguration();
  const params = qsParams;

  const request = {
    method,
    url: endpointUrl,
    ...(params ? { params } : null),
    ...(data ? { data } : null),
    ...(headers ? { headers } : {}),
    ...(proxy ? { proxy } : {}),
    responseType,
  };

  try {
    if (responseType === REQUEST_STREAM_TYPE) {
      const writer = createWriteStream(fileName);
      const response = await axios(request);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          logger.log(INFO, `File dowloaded: ${endpointUrl}`);
          resolve();
        });

        response.data.on(ERROR, () => {
          this.logger.log(ERROR, 'Error on get streaming response');
          reject();
        });
      });
    } else {
      const response = await axios(request);
      logger.log(INFO, `API Request End: ${endpointUrl}`);
      return response;
    }
  } catch (err) {
    handleError(err);
    return err;
  }
};

/**
 * Send request with pre-check properties
 * @param {RequestOptions} options - Request options
 * @returns {Promise<object>} Request response
 * @throws {ReferenceError} On failed request
 */
const apiSendRequest = async ({
  method,
  endpointUrl,
  headers = null,
  qsParams = null,
  payload = null,
  responseType = REQUEST_DEFAULT_TYPE,
  fileName = null,
}) => {
  logger.log(
    INFO,
    `Sending API Request: ${method} ${endpointUrl} - ${headers} - ${qsParams} - ${payload}`,
  );
  let errorMsg = '';
  if (!headers) {
    errorMsg = 'Headers for Factiva requests cannot be empty';
    logger.log(ERROR, errorMsg);
    throw ReferenceError(errorMsg);
  }

  if (typeof headers !== 'object') {
    errorMsg = 'Unexpected headers value';
    logger.log(ERROR, errorMsg);
    throw ReferenceError(errorMsg);
  }

  const methUpper = method.toUpperCase();
  if (methUpper !== 'POST' && methUpper !== 'GET' && methUpper !== 'DELETE') {
    errorMsg = 'Unexpected method value';
    logger.log(ERROR, errorMsg);
    throw ReferenceError(errorMsg);
  }

  const response = await sendRequest({
    method: methUpper,
    endpointUrl,
    headers,
    params: qsParams,
    payload,
    responseType,
    fileName,
  });
  return response;
};

/**
 *
 * @param {string} fileUrl - URL of the file to be downloaded.
 * @param {string} headers - Auth headers
 * @param {string} fileName - Name to be used as local filename
 * @param {string} fileExtension - Extension of the file
 * @param {string} toSavePath - Path to be used to store the file
 * @param {boolean} [addTimestamp=false] - Flag to determine if include timestamp info at the filename
 * @returns {string} -  Dowloaded file path
 */
const downloadFile = async (
  fileUrl,
  headers,
  fileName,
  fileExtension,
  toSavePath,
  addTimestamp = false,
) => {
  logger.log(
    INFO,
    `Downloading file: ${fileUrl} - ${fileName} - ${fileExtension}`,
  );
  validateOption(fileExtension, API_EXTRACTION_FILE_FORMATS);
  createPathIfNotExist(toSavePath);
  if (addTimestamp) {
    const timeStamp = new Date().toISOString();
    fileName = `${fileName}-${timeStamp}`;
  }
  const localFileName = join(toSavePath, `${fileName}.${fileExtension}`);

  await sendRequest({
    method: 'GET',
    endpointUrl: fileUrl,
    headers,
    responseType: REQUEST_STREAM_TYPE,
    fileName: localFileName,
  });
  return localFileName;
};

const getCurrentDate = () => {
  const date = new Date();
  const _month = date.getMonth() + 1;
  return `${date.getFullYear()}${fmtShortDate(_month)}${date.getDate()}`;
};
const isotsToMsts = (isodate) => {
  const date = new Date(isodate);
  return date.getTime() / 1000;
};

const formatTimestamps = (message) => {
  TIMESTAMP_FIELDS.forEach((timeName) => {
    if (Object.keys(message).includes(timeName)) {
      message[timeName] = isotsToMsts(message[timeName]);
    }
  });
  message['delivery_datetime'] = Date.now() / 1000;
  return message;
};

const formatTimestampsMongoDB = (message) => {
  TIMESTAMP_FIELDS.forEach((timeName) => {
    if (Object.keys(message).includes(timeName)) {
      message[timeName] = new Date(message[timeName]);
    }
  });
  message['delivery_datetime'] = new Date();
  return message;
};

const multivalueToList = (fieldValue = null, sep = ',') => {
  let retVal = [];
  if (!fieldValue || fieldValue === '') {
    retVal = [];
  } else {
    const allVals = fieldValue.split(sep);
    allVals.forEach((value) => {
      if (value !== '') {
        retVal.push(value);
      }
    });
  }
  return retVal;
};

const formatMultivalues = (message) => {
  MULTIVALUE_FIELDS_SPACE.forEach((fieldSpace) => {
    if (Object.keys(message).includes(fieldSpace)) {
      message[fieldSpace] = multivalueToList(message[fieldSpace], ' ');
    }
  });
  MULTIVALUE_FIELDS_COMMA.forEach((fieldComma) => {
    if (Object.keys(message).includes(fieldComma)) {
      message[fieldComma] = multivalueToList(message[fieldComma]);
    }
  });
  return message;
};

const createPathIfNotExist = (path) => {
  if (!existsSync(path)) {
    logger.log(DEBUG, `Creating directory: ${path}`);
    mkdirSync(path);
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getLogDateFormat = () => {
  const date = new Date();
  const _month = date.getMonth() + 1;
  return `${fmtShortDate(date.getDate())}-${fmtShortDate(
    _month,
  )}-${date.getFullYear()}`;
};

const fmtShortDate = (dateNum) => (dateNum < 10 ? `0${dateNum}` : dateNum);

/** Include common and helper functions */
module.exports = {
  loadEnvVariable,
  apiSendRequest,
  loadDefaultEnvVariable,
  validateType,
  maskWord,
  getProxyConfiguration,
  validateOption,
  downloadFile,
  formatTimestamps,
  formatMultivalues,
  createPathIfNotExist,
  getCurrentDate,
  sleep,
  getLogDateFormat,
  formatTimestampsMongoDB,
};
