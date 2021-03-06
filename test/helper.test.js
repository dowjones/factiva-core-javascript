/* eslint-disable no-undef */
const chai = require('chai');
const config = require('config');

const { expect } = chai;

const { helper } = require('../lib/factiva');

describe('factiva', () => {
  beforeEach(() => {
    config.proxy.use = false;
    config.proxy.auth.username = '';
    config.proxy.auth.password = '';
  });

  describe('use helper library', () => {
    it('should return a load env variable', () => {
      const loadedVar = helper.loadEnvVariable('userKey');
      expect(loadedVar).to.be.not.equal('change for user key');
    });
    it('should return an undefined env variable', (done) => {
      try {
        helper.loadEnvVariable('KEY');
        should.fail('no error was thrown when it should have been');
      } catch (err) {
        done();
      }
    });
    it('should get proxy configurations', () => {
      config.proxy.use = true;
      const options = helper.getProxyConfiguration();
      expect(options).to.be.instanceOf(Object);
    });
    it('should get empty proxy configurations', () => {
      const options = helper.getProxyConfiguration();
      expect(options).to.be.equal(null);
    });
    it('should get empty proxy configurations with no auth', () => {
      config.proxy.use = true;
      const options = helper.getProxyConfiguration();
      expect(options).to.not.have.property('auth');
    });
    it('should get empty proxy configurations with no auth - no username', () => {
      config.proxy.use = true;
      config.proxy.auth.username = 'demo';
      const options = helper.getProxyConfiguration();
      expect(options).to.not.have.property('auth');
    });
    it('should get empty proxy configurations with no auth - no password', () => {
      config.proxy.use = true;
      config.proxy.auth.password = 'demo';
      const options = helper.getProxyConfiguration();
      expect(options).to.not.have.property('auth');
    });
    it('should get proxy proxy configurations with auth', () => {
      config.proxy.use = true;
      config.proxy.auth.username = 'demo';
      config.proxy.auth.password = 'demo';
      const options = helper.getProxyConfiguration();
      expect(options).to.have.property('auth');
    });
  });
});
