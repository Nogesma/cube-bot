const chai = require('chai');
const {averageOfFiveCalculator} = require('../../app/tools/calculators');

chai.should();

describe('app/tools/calculators.js', () => {
  describe('#averageOfFiveCalculator()', () => {
    context('when wrong letters in array', () => {
      it('should return error message', () => {
        averageOfFiveCalculator(['2', '3', '4', '6', 'aze']).should.be
          .equal('You must give an array of 5 numbers');
      });
    });

    context('when array is not the good size ', () => {
      it('should return error message', () => {
        averageOfFiveCalculator(['2', '3', '4', '5']).should.be
          .equal('You must give an array of 5 numbers');
        averageOfFiveCalculator(['2', '3', '4', '5', '6', '7']).should.be
          .equal('You must give an array of 5 numbers');
      });
    });

    context('When array contains string of numbers', () => {
      it('should return the average', () => {
        averageOfFiveCalculator(['13', '4', '5', '3', '6']).should.be
          .equal(4);
        averageOfFiveCalculator(['12', '13', '17', '15', '22']).should.be
          .equal(15);
      });
    });

    context('When array contains numbers', () => {
      it('should return the average', () => {
        averageOfFiveCalculator([13, 4, 5, 3, 6]).should.be
          .equal(4);
        averageOfFiveCalculator([12, 13, 17, 15, 22]).should.be
          .equal(15);
      });
    });
  });
});
