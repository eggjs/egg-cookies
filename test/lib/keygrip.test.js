'use strict';

const Keygrip = require('../../lib/keygrip');
const assert = require('assert');

describe('test/lib/keygrip.test.js', () => {
  it('should throw without keys', () => {
    assert(shouldThrow(() => new Keygrip()) === 'keys must be provided and should be an array');
    assert(shouldThrow(() => new Keygrip([])) === 'keys must be provided and should be an array');
    assert(shouldThrow(() => new Keygrip('hello')) === 'keys must be provided and should be an array');
  });

  it('should encrypt and decrypt success', () => {
    const keygrip = new Keygrip([ 'foo', 'bar' ]);
    const newKeygrip = new Keygrip([ 'another', 'foo' ]);

    const encrypted = keygrip.encrypt('hello');
    assert(keygrip.decrypt(encrypted).value.toString() === 'hello');
    assert(keygrip.decrypt(encrypted).index === 0);
    assert(newKeygrip.decrypt(encrypted).value.toString() === 'hello');
    assert(newKeygrip.decrypt(encrypted).index === 1);
  });

  it('should decrypt error return false', () => {
    const keygrip = new Keygrip([ 'foo', 'bar' ]);
    const newKeygrip = new Keygrip([ 'another' ]);

    const encrypted = keygrip.encrypt('hello');
    assert(keygrip.decrypt(encrypted).value.toString() === 'hello');
    assert(keygrip.decrypt(encrypted).index === 0);
    assert(newKeygrip.decrypt(encrypted) === false);
  });

  it('should signed and verify success', () => {
    const keygrip = new Keygrip([ 'foo', 'bar' ]);
    const newKeygrip = new Keygrip([ 'another', 'foo' ]);

    const signed = keygrip.sign('hello');
    assert(keygrip.verify('hello', signed) === 0);
    assert(newKeygrip.verify('hello', signed) === 1);
  });

  it('should signed and verify failed return -1', () => {
    const keygrip = new Keygrip([ 'foo', 'bar' ]);
    const newKeygrip = new Keygrip([ 'another' ]);

    const signed = keygrip.sign('hello');
    assert(keygrip.verify('hello', signed) === 0);
    assert(newKeygrip.verify('hello', signed) === -1);
  });
});

function shouldThrow(fn) {
  try {
    fn();
  } catch (err) {
    return err.message;
  }
  throw new Error('not thrown');
}
