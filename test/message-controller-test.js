const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const moment = require('moment');

const stub = sinon.stub().resolves();

const {incomingMessage} = proxyquire('../app/controllers/message-controller', {
  './cube-db': {
    insertNewTimes: stub
  },
  moment: () => {
    return moment('2018-01-01');
  }
});

chai.use(sinonChai);
chai.should();

describe.skip('app/controllers/message-controller.js', () => {
  describe('#incomingMessage()', () => {
    before(() => {
    });

    after(async () => {
      const mongoose = require('mongoose');
      await mongoose.disconnect();
    });

    it('should call insertNewTimes', async () => {
      await incomingMessage({
        content: '?t 333 12 13 14 15 16',
        channel: {
          send: () => {
          }
        },
        author: {id: 'author'}
      });
      stub.should.have.been.calledWith('2018-01-01', 'author', '333',
        ['12', '13', '14', '15', '16']);
    });
  });
});
