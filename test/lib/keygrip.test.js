'use strict';

const Keygrip = require('../../lib/keygrip');
const assert = require('assert');

describe('test/lib/keygrip.test.js', () => {
  it('should throw without keys', () => {
    assert(shouldThrow(() => new Keygrip()) === 'keys must be provided and should be an array');
    assert(shouldThrow(() => new Keygrip([])) === 'keys must be provided and should be an array');
    assert(shouldThrow(() => new Keygrip('hello')) === 'keys must be provided and should be an array');
    assert(shouldThrow(() => new Keygrip([ '', 'afa', []])) === 'each of Keys is either object or string');
    assert(shouldThrow(() => new Keygrip([[], { key: '11111111111111', iv: 'fafafa' }])) === 'each of Keys is either object or string');
    assert(shouldThrow(() => new Keygrip([{ key: '11111111111111', iv: 'fafafa' }])) === 'if the Key is object,key property must be privided with a string of 32 length');
    assert(shouldThrow(() => new Keygrip([{ key: '11111111111111111111111111111111', iv: 'fafa' }])) === 'if the Key is object,iv property must be privided with a string of 16 length');
  });

  it('should encrypt and decrypt success', () => {
    const keygrip = new Keygrip([ 'foo', 'bar' ]);
    const newKeygrip = new Keygrip([ 'another', 'foo' ]);

    const encrypted = keygrip.encrypt('hello');
    assert(keygrip.decrypt(encrypted).value.toString() === 'hello');
    assert(keygrip.decrypt(encrypted).index === 0);
    assert(newKeygrip.decrypt(encrypted).value.toString() === 'hello');
    assert(newKeygrip.decrypt(encrypted).index === 1);


    const keygripX = new Keygrip([{ key: '12345678900987654321123456789009', iv: '1234567890098765' }, 'key' ]);
    const newKeygripX = new Keygrip([{ key: '11111111111111110000000000000000', iv: '1111111177777777' }, { key: '12345678900987654321123456789009', iv: '1234567890098765' }]);
    const encryptedX = keygripX.encrypt('hello');
    console.log(encryptedX);
    assert(keygripX.decrypt(encryptedX).value.toString() === 'hello');
    assert(keygripX.decrypt(encryptedX).index === 0);
    assert(newKeygripX.decrypt(encryptedX).value.toString() === 'hello');
    assert(newKeygripX.decrypt(encryptedX).index === 1);
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

    const keygripX = new Keygrip([{ key: '12345678900987654321123456789009', iv: '1234567890098765' }, 'key' ]);
    const newKeygripX = new Keygrip([{ key: '11111111111111110000000000000000', iv: '1111111177777777' }, { key: '12345678900987654321123456789009', iv: '1234567890098765' }]);

    const signedX = keygripX.sign('hello');
    assert(keygripX.verify('hello', signedX) === 0);
    assert(newKeygripX.verify('hello', signedX) === 1);
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
