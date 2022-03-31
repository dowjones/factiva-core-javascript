import { join } from 'path';
import config from 'config';

const envVar = (key, defVariable = null) => {
  return config[key] || defVariable;
};

const REQUEST_STREAM_TYPE = 'stream';
const REQUEST_DEFAULT_TYPE = 'json';
const DOWNLOAD_DEFAULT_FOLDER = envVar(
  'dowloadFilesDir',
  join(process.cwd(), 'downloads'),
);
const LISTENER_FILES_DEFAULT_FOLDER = envVar(
  'listenerFilesDir',
  join(process.cwd(), 'files'),
);

const LOGS_DEFAULT_FOLDER = envVar('logFilesDir', join(process.cwd(), 'logs'));

module.exports = {
  REQUEST_STREAM_TYPE,
  REQUEST_DEFAULT_TYPE,
  DOWNLOAD_DEFAULT_FOLDER,
  LISTENER_FILES_DEFAULT_FOLDER,
  LOGS_DEFAULT_FOLDER,
};
