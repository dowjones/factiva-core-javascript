# Factiva Core Javascript

Javascript package with root definitions and dictionaries, to support other functional packages.

* **APIKeyUser**: Represents an API user defined as a user key only (no O-Auth).
* **StreamUser**: Represents an user used for Streams which can authenticate with a user key or O-Auth.
* **Dicts**: Module that contains mulitple dictionaries for data combination or better human-reading.

## Installation

* Be sure to have installed node 13
* Install all dependencies from the root -> `npm install`
* Run `npm run babel` for using the transpile version
* Example of importing a module

  ```js
    const { UserKey } = require('./lib/factiva/core');
    const { StreamUser } = require('./lib/factiva/core');
  ```

## Usage

  Example of UserKey

  ```js
    const apiKey = 'aaabbccccdeded';
    const requestInfo = false;

    // Using promise
    UserKey.create(apiKey, requestInfo)
      .then((user) => console.log(user));

    // Using async/await
    const user = await UserKey.create(apiKey, requestInfo);

  ```

  Example of Dicts

  ```js  
    const industriesHierarchyCodes = dicts.industriesHierarchy();
    console.log(industriesHierarchyCodes.show());
  ```
  
  Example of StreamUser

  ```js
    const apiKey = 'aaabbccccdeded';
    const streamUser = new StreamUser(apiKey);
    
    // Using promise
    streamUser.getStreams()
      .then((streams) => console.log(streams));
    
    // Using async/await
    const streams = await streamUser.getStreams();

  ```

## Environment vars

### Required

  ```bash
    USER_KEY=loremipsum12345
  ```

### Optionals

  ```bash
    PROXY_USE=false
    PROXY_PROTOCOL=https
    PROXY_HOST=localhost
    PROXY_PORT=80

    # If auth is required
    PROXY_AUTH_USER=user
    PROXY_AUTH_PASSWORD=pass
  ```

## Build lib

Run the command in cli

  ```bash
    npm run babel
  ```

## Tests

Run the command in cli

  ```bash
    npm run test
  ```

## Build and run test

Run the command in cli

  ```bash
    npm run test-debug
  ```

## Create documentation

Run the command in cli

  ```bash
    npm run doc
  ```
