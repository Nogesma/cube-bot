const chai = require('chai');
const moment = require('moment');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

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

describe.skip('app/controllers/message-controller', () => {
  describe('#incomingMessage()', () => {
    before(() => {});

    after(async () => {
      const mongoose = require('mongoose');
      await mongoose.disconnect();
    });

    it('should call newTimesCommand', async () => {
      await incomingMessage({
        content: '?t 333 12 13 14 15 16',
        channel: {
          send: () => {}
        },
        author: {id: 'author'}
      });
      stub.should.have.been.calledWith('2018-01-01', 'author', '333', [
        '12',
        '13',
        '14',
        '15',
        '16'
      ]);
    });

    it('should call helpCommand', async () => {
      await incomingMessage({
        content: '?h' || '?help',
        channel: {
          send: () => {}
        }
      });
    });

    it('should call dailyRanksCommand', async () => {
      await incomingMessage({
        content: '?classement 333 2018-01-01',
        channel: {
          send: () => {}
        }
      });
      stub.should.have.been.calledWith('333', '2018-01-01');
    });

    it('should call monthlyRanksCommand', async () => {
      await incomingMessage({
        content: '?classementmois 333 2018-01',
        channel: {
          send: () => {}
        }
      });
      stub.should.have.been.calledWith('333', '2018-01');
    });

    it('should call dididoCommand', async () => {
      await incomingMessage({
        content: '?didido 333',
        channel: {
          send: () => {}
        },
        author: {id: 'author'}
      });
      stub.should.have.been.calledWith('author', '333');
    });
  });
});
