/**
 * @module factiva/helper
 */

import axios from 'axios';
import config from 'config';
import { createWriteStream } from 'fs';
import createError from 'http-errors';
import { REQUEST_DEFAULT_TYPE, REQUEST_STREAM_TYPE } from '../core/constants';

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
const loadEnvVariable = (configKey) => {
  const tmpVal = config[configKey];
  if (!tmpVal) {
    throw ReferenceError(`Environment Variable ${configKey} not found!`);
  }

  return tmpVal;
};

/**
 * Find the value of an environment variable, if not exist return a default value
 * @param {string} envVarName - Name to environment variablñe to find
 * @param {any} defaultValue - Default value
 * @returns {any} Value of the environment variables
 */
const loadGenericEnvVariable = (envVarName, defaultValue) => {
  try {
    return loadEnvVariable(envVarName);
  } catch (e) {
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
    throw new RangeError(
      `Option value ${option} is not within the allowed options: ${validOptions}`,
    );
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
  if (err.response.status === 403) {
    throw createError(403, 'Factiva API-Key does not exist or inactive.');
  }

  if (err.response.data.errors) {
    const errors = err.response.data.errors
      .map((error) => `${error.title}: ${error.detail}`)
      .join();
    throw createError(
      err.response.status,
      `Unexpected API Error with message: ${err.response.statusText}: ${errors}`,
    );
  }

  throw createError(
    err.response.status,
    `Unexpected API Error with message: ${err.response.statusText}.`,
  );
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
    throw ReferenceError('Unexpected qsParams value');
  }

  let data;
  if (method === 'POST' && payload) {
    if (typeof payload === 'object') {
      data = payload;
    } else if (typeof payload === 'string') {
      data = JSON.parse(payload);
    } else {
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
          resolve();
        });

        response.data.on('error', () => {
          reject();
        });
      });
    } else {
      const response = await axios(request);
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
  if (!headers) {
    throw ReferenceError('Headers for Factiva requests cannot be empty');
  }

  if (typeof headers !== 'object') {
    throw ReferenceError('Unexpected headers value');
  }

  const methUpper = method.toUpperCase();
  if (methUpper !== 'POST' && methUpper !== 'GET' && methUpper !== 'DELETE') {
    throw ReferenceError('Unexpected method value');
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

/** Include common and helper functions */
module.exports = {
  loadEnvVariable,
  apiSendRequest,
  loadGenericEnvVariable,
  validateType,
  maskWord,
  getProxyConfiguration,
  validateOption,
};
