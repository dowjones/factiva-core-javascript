/* eslint-disable no-undef */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const { expect } = chai;
chai.use(chaiAsPromised);

const { StreamUser } = require('../lib/factiva/core');
const { loadEnvVariable } = require('../lib/factiva/helper');
const VALID_USER_KEY = loadEnvVariable('userKey');

describe('factiva', () => {
  describe('create a StreamUser', () => {
    const streamUser = new StreamUser();
    it('should return a object type StreamUser', async () => {
      expect(streamUser).to.be.instanceOf(Object);
    });
    it('should return an array of stream responses', async () => {
      expect(streamUser.getStreams()).to.eventually.have.property('data');
    });
    it('should return a pubsub client', async () => {
      // eslint-disable-next-line prettier/prettier
      expect(streamUser.getClientSubscription()).to.eventually.have.property(
        'data',
      );
    });
    it('should return stream credentials', async () => {
      const streamUser = new StreamUser(VALID_USER_KEY);
      const credentials = await streamUser.fetchCredentials();
      expect(credentials).to.be.instanceOf(Object);
      expect(credentials).to.be.have.property('private_key');
    }).timeout(0);
    it('should get pubsub', async () => {
      const streamUser = new StreamUser(VALID_USER_KEY);
      const pubSub = await streamUser.getClientSubscription();
      expect(pubSub).to.be.instanceOf(Object);
    }).timeout(0);
  });
});
