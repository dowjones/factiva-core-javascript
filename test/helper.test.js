/* eslint-disable no-undef */
const chai = require('chai');
const config = require('config');
const fs = require('fs');

const { expect } = chai;

const { helper, core } = require('../lib/factiva');
const {
  constants: {
    API_HOST,
    API_SNAPSHOTS_TAXONOMY_BASEPATH,
    API_SNAPSHOTS_COMPANIES_PIT,
    TICKER_COMPANY_IDENTIFIER,
    DOWNLOAD_DEFAULT_FOLDER,
  },
} = core;
const VALID_USER_KEY = helper.loadEnvVariable('userKey');

const downloadPITLink = (identifier, fileFormat) =>
  `${API_HOST}${API_SNAPSHOTS_TAXONOMY_BASEPATH}${API_SNAPSHOTS_COMPANIES_PIT}/${identifier}/${fileFormat}`;
const headers = { 'user-key': VALID_USER_KEY };

describe('factiva', () => {
  beforeEach(() => {
    delete config.proxy;
    delete config.userKey;
  });

  after(() => {
    fs.rmdirSync(DOWNLOAD_DEFAULT_FOLDER, { recursive: true });
  });

  describe('use helper library', () => {
    it('should return a load env variable', () => {
      config.userKey = 'demo12345';
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
      config.proxy = { use: true };
      const options = helper.getProxyConfiguration();
      expect(options).to.be.instanceOf(Object);
    });
    it('should get empty proxy configurations', () => {
      const options = helper.getProxyConfiguration();
      expect(options).to.be.equal(null);
    });
    it('should get proxy configurations with no auth', () => {
      config.proxy = { use: true };
      const options = helper.getProxyConfiguration();
      expect(options).to.not.have.property('auth');
    });
    it('should get proxy configurations with no auth - no password', () => {
      config.proxy = { use: true, auth: { username: 'demo' } };
      const options = helper.getProxyConfiguration();
      expect(options).to.not.have.property('auth');
    });
    it('should get empty proxy configurations with no auth - no username', () => {
      config.proxy = { use: true, auth: { password: 'demo' } };
      const options = helper.getProxyConfiguration();
      expect(options).to.not.have.property('auth');
    });
    it('should get proxy proxy configurations with auth', () => {
      config.proxy = {
        use: true,
        auth: { username: 'demo', password: 'demo' },
      };
      const options = helper.getProxyConfiguration();
      expect(options).to.have.property('auth');
    });
    it('should download a csv file', async () => {
      const fileFormat = 'csv';
      const fileName = await helper.downloadFile(
        downloadPITLink(TICKER_COMPANY_IDENTIFIER, fileFormat),
        headers,
        'demo',
        fileFormat,
        DOWNLOAD_DEFAULT_FOLDER,
        true,
      );
      expect(fileName).to.be.a('string');
    }).timeout(0);
    it('should fail at download a diferent file', async () => {
      const fileFormat = 'jpg';
      try {
        await helper.downloadFile(
          downloadPITLink(TICKER_COMPANY_IDENTIFIER, fileFormat),
          headers,
          'demo',
          fileFormat,
          DOWNLOAD_DEFAULT_FOLDER,
          true,
        );
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    }).timeout(0);
  });
});
