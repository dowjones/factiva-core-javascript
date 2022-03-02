/**
 *  @module factiva/core/StreamUser
 */

import { PubSub, v1 } from '@google-cloud/pubsub';
import helper from '../helper';
import { UserKey } from './auth';
import constants from './constants';
import StreamResponse from './StreamReponse';

const DEFAULT_HOST_DNA = `${constants.API_HOST}${constants.DNA_BASEPATH}`;
const DEFAULT_HOST_ALPHA = `${constants.API_HOST}${constants.ALPHA_BASEPATH}`;

/**
 * Class used to get stream info related by a user
 * @extends UserKey  {@link Classes:UserKey}.
 */
class StreamUser extends UserKey {
  /** Constructor
   * @param {string} key - User key
   * @param {boolean} requestInfo - Flag to determine if the info from the user needs to be found and set
   */
  constructor(key, requestInfo) {
    super(key, requestInfo);
  }

  /**
   * Return a list of streams from a given user
   * @returns {StreamResponse} objects which contains stream information
   */
  async getStreams() {
    const headers = this.getAuthenticationHeaders();
    const response = await helper.apiSendRequest({
      method: 'GET',
      endpointUrl: `${constants.API_HOST}${constants.API_STREAMS_BASEPATH}/`,
      headers,
    });

    return response.data.data.map((stream) => new StreamResponse(stream));
  }

  /**
   * Return the pubsub client for pubsub
   * @returns {PubSub} Pubsub client
   * @throws {URIError} if something unexpected happens while creating the client
   */
  async getClientSubscription() {
    const credentials = await this.fetchCredentials();
    try {
      const pubsubClient = new v1.SubscriberClient({
        projectId: credentials.project_id,
        credentials,
      });

      return pubsubClient;
    } catch (_) {
      throw URIError(
        // eslint-disable-next-line
        'Something unexpected happened while creating Pubsub client',
      );
    }
  }

  /**
   * Return the google auhtentication credentials for pubsub.
   * @returns {string} credentials for pubsub in string format
   * @throws {URIError} if the credentials cannot be parsed
   */
  async fetchCredentials() {
    const headers = this.getAuthenticationHeaders();
    const uri = StreamUser.getUriContext(headers);
    const response = await helper.apiSendRequest({
      method: 'GET',
      endpointUrl: `${uri}${constants.API_ACCOUNT_STREAM_CREDENTIALS_BASEPATH}`,
      headers,
    });

    try {
      const streamingCredentials =
        response.data.data.attributes.streaming_credentials;

      return JSON.parse(streamingCredentials);
    } catch (e) {
      throw URIError('Unable to find streaming credentials for given account');
    }
  }

  /**
   * Return the uri based on the headers used.
   * @returns {string} Returns the uri in string format which can be used for
   */
  static getUriContext(headers) {
    if ('Authorization' in headers) {
      return DEFAULT_HOST_DNA;
    }

    if ('user-key' in headers) {
      return DEFAULT_HOST_ALPHA;
    }

    const msg = `Could not determine user credentials:
    Must specify account credentials as key
    through env vars`;

    throw ReferenceError(msg);
  }
}
/** Module to build a get information about streams by a user */
module.exports = StreamUser;
