'use strict';

const assert = require('assert');
const mm = require('egg-mock');
const request = require('supertest');


describe('start testing long cookies', () => {
  let app;
  let agent;

  before(() => {
    app = mm.app({ baseDir: 'long-cookie' });
    return app.ready();
  });

  beforeEach(() => {
    agent = request.agent(app.callback());
  });

  after(() => app.close());

  it('throws error on cookie limit exceed', async () => {
    const res = await agent.get('/long-cookie')
      .expect(500);

    assert(res.body.message.startsWith('cookie limit exceeded: EGG_SESS'));
  });
});
