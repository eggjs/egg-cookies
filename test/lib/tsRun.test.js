'use strict';

const assert = require('assert');

describe('start running ts file under the ts folder...', () => {

  it('should run successfully and generate a json file to compare values', () => {

        // This will dynamically add cookieTest and have a run
    require('ts-node').register({ typeCheck: true });
    const result = require('../fixtures/ts/cookiesTest');

        // Check one by one
    assert(result.test1.actualValue === 'bar');
    assert(result.test1.actualIndex === -1);
    assert(result.test2.actualValue === 'bar');
    assert(undefined === result.test3.actualValue);
  });
});
