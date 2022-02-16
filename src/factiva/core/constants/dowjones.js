/* eslint-disable operator-linebreak */
// Dow Jones
const API_HOST = 'https://api.dowjones.com';
const API_ACCOUNT_OAUTH2_HOST = 'https://accounts.dowjones.com/oauth2/v1/token';
const API_LATEST_VERSION= "2.0"

const API_ACCOUNT_BASEPATH = '/alpha/accounts';
const API_ACCOUNT_STREAM_CREDENTIALS_BASEPATH =
  '/alpha/accounts/streaming-credentials';

const ALPHA_BASEPATH = '/alpha';
const DNA_BASEPATH = '/dna';

module.exports = {
  API_HOST,
  API_ACCOUNT_OAUTH2_HOST,
  API_ACCOUNT_BASEPATH,
  API_ACCOUNT_STREAM_CREDENTIALS_BASEPATH,
  ALPHA_BASEPATH,
  DNA_BASEPATH,
  API_LATEST_VERSION
};
