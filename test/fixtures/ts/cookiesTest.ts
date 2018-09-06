import EggCookies = require('../../../');
import { EventEmitter } from 'events';

// Notice that this is a mocked function for 'ctx'
// Because in a real env we cannot use this.cookies.ctx
// and this is only for inner test.
function CreateCookie(req?: any, options?: any): EggCookies {
    options = options || {};
    let keys = options.keys;
    keys = keys === undefined ? ['key', 'keys'] : keys;
    const ctx: any = { secure: options.secure };
    ctx.app = new EventEmitter();
    // Here we must use <any> to convert, otherwises
    // it cannot pass compile successfully
    ctx.request = (<any>Object).assign({
        headers: {},
        get(key) {
            return this.headers[key];
        }
    }, req);

    ctx.response = {
        headers: {},
        get(key) {
            return this.headers[key];
        },
        set(key, value) {
            this.headers[key] = value;
        }
    };

    ctx.get = ctx.request.get.bind(ctx.request);
    ctx.set = ctx.response.set.bind(ctx.response);
    return new EggCookies(ctx, keys);
}

/**
 * This test will define a JSON object called 'saveActualAnswer',
 * and it will save some expected values, or actual values.
 * Then the JSON object will be exported to compare with.
 */
const saveActualAnswer: any =
{
    test1: {},
    test2: {},
    test3: {}
};

// Test 1: should encrypt ok
let cookies = CreateCookie();
cookies.set('foo', 'bar', { encrypt: true });
let cookie = cookies.ctx.response.headers['set-cookie'][0];
cookies.ctx.request.headers.cookie = cookie;
let value = cookies.get('foo', { encrypt: true });
// Expect value is 'bar'.
saveActualAnswer.test1.actualValue = value;
// Expect value is -1.
saveActualAnswer.test1.actualIndex = cookie.indexOf('bar');


// Test 2: should signed work fine
cookies = CreateCookie();
cookies.set('foo', 'bar', { signed: true });
cookie = cookies.ctx.response.headers['set-cookie'].join(';');
cookies.ctx.request.headers.cookie = cookie;
value = cookies.get('foo', { signed: true });
// Expect value is 'bar'
saveActualAnswer.test2.actualValue = value;

// Test 3: should return undefined when header.cookie not exists
cookies = CreateCookie();
value = cookies.get('hello');
// Expect value is undefined
saveActualAnswer.test3.actualValue = value;

// Finally export this directly for 'tsRun.test.js' to test with
export = saveActualAnswer;
