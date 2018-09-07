import EggCookies = require('../../../');
import { EventEmitter } from 'events';

// This function creates a new instance of Cookie by mocking
// a ctx there.
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
        get(key: any) {
            return this.headers[key];
        }
    }, req);

    ctx.response = {
        headers: {},
        get(key: any) {
            return this.headers[key];
        },
        set(key: any, value: any) {
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
    test3: {},
    test4: null
};

// Test 1: should encrypt ok
let cookies = CreateCookie();
cookies.set('foo', 'bar', { encrypt: true });
let cookie = (<any>cookies).ctx.response.headers['set-cookie'][0];
(<any>cookies).ctx.request.headers.cookie = cookie;
let value = cookies.get('foo', { encrypt: true });
// Expect value is 'bar'.
saveActualAnswer.test1.actualValue = value;
// Expect value is -1.
saveActualAnswer.test1.actualIndex = cookie.indexOf('bar');


// Test 2: should signed work fine
cookies = CreateCookie();
cookies.set('foo', 'bar', { signed: true });
cookie = (<any>cookies).ctx.response.headers['set-cookie'].join(';');
(<any>cookies).ctx.request.headers.cookie = cookie;
value = cookies.get('foo', { signed: true });
// Expect value is 'bar'
saveActualAnswer.test2.actualValue = value;

// Test 3: should return undefined when header.cookie not exists
cookies = CreateCookie();
value = cookies.get('hello');
// Expect value is undefined
saveActualAnswer.test3.actualValue = value;

// Test 4: should emit cookieLimitExceed event in app when value\'s length exceed the limit
cookies = CreateCookie();
value = Buffer.allocUnsafe(4094).fill(49).toString();

// Create a test4 with a promisible function and check the answer later
// in the ts.test.js
saveActualAnswer.test4 = new Promise((succ: any) => {
    (<any>cookies).app.on('cookieLimitExceed', (params: any) => {
        const test4: any = {};
        // Expect value is 'foo'
        test4.name = params.name;
        // Except value is new Buffer(4094).fill(49).toString()
        test4.value = params.value;
        // Except value isn't null or undefined
        test4.hasCtx = params.ctx;

        setImmediate(() => {
            // Except value is true
            test4.match = (<any>cookies).ctx.response.headers['set-cookie'][0].match(/foo=1{4094};/);
            succ(test4);
        });
    });
    cookies.set('foo', value);
});


// Finally export this directly for 'tsRun.test.js' to test with
export = saveActualAnswer;
