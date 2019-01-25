const chai = require('chai');
const {
  averageOfFiveCalculator,
  computeScore,
  timeToSeconds,
  secondsToTime
} = require('../../app/tools/calculators');

chai.should();

describe('app/tools/calculators.js', () => {
  describe('#averageOfFiveCalculator()', () => {
    context('when wrong letters in array', () => {
      it('should return error message', () => {
        averageOfFiveCalculator(['2', '3', '4', '6', 'aze']).should.be
          .equal(-Infinity);
      });
    });

    context('when array is not the good size', () => {
      it('should return error message', () => {
        averageOfFiveCalculator(['2', '3', '4', '5']).should.be
          .equal(-Infinity);
        averageOfFiveCalculator(['2', '3', '4', '5', '6', '7']).should.be
          .equal(-Infinity);
      });
    });

    context('when negative number in array', () => {
      it('should return error message', () => {
        averageOfFiveCalculator(['-2', '3', '4', '5', '6']).should.be
          .equal(-Infinity);
      });
    });

    context('When array contains string of numbers', () => {
      it('should return the average', () => {
        averageOfFiveCalculator(['13', '4', '5', '3', '6']).should.be
          .equal(5.00);
        averageOfFiveCalculator(['12.34', '0.05', '78.32', '34.21', '9.95'])
          .should.be.equal(18.83);
        averageOfFiveCalculator(['12', '13', '17', '15', '22']).should.be
          .equal(15.00);
        averageOfFiveCalculator([Infinity, '4', Infinity, '3', '6']).should.be
          .equal(Infinity);
        averageOfFiveCalculator(['15', Infinity, '5', '3', '6']).should.be
          .equal(8.67);
      });
    });

    context('When array contains numbers', () => {
      it('should return the average', () => {
        averageOfFiveCalculator([13, 4, 5, 3, 6]).should.be
          .equal(5);
        averageOfFiveCalculator([12.34, 0.05, 78.32, 34.21, 9.95])
          .should.be.equal(18.83);
        averageOfFiveCalculator([12, 13, 17, 15, 22]).should.be
          .equal(15);
      });
    });
  });

  describe('#computeScore()', () => {
    context('Compute the scores', () => {
      it('should return max points when first', () => {
        computeScore(10, 0).should.be.equal(100);
        computeScore(1, 0).should.be.equal(100);
      });

      it('should return min points when last', () => {
        computeScore(10, 9).should.be.equal(50);
        computeScore(50, 49).should.be.equal(50);
        computeScore(301, 300).should.be.equal(50);
        computeScore(2, 1).should.be.equal(50);
      });

      it('should return points based on rank', () => {
        computeScore(3, 1).should.be.equal(75);
        computeScore(10, 5).should.be.equal(73);
        computeScore(301, 122).should.be.equal(80);
      });
    });
  });

  describe('#timeToSeconds()', () => {
    context('Convert mm:ss in seconds', () => {
      it('should return the time in seconds', () => {
        timeToSeconds('DNF').should.be.equal(Infinity);
        timeToSeconds('12+').should.be.equal(12);
        timeToSeconds('1:34.23').should.be.equal(94.23);
      });
    });
  });

  describe('#secondsToTime()', () => {
    context('Convert seconds in mm:ss', () => {
      it('should return the time in mm:ss', () => {
        secondsToTime(Infinity).should.be.equal('DNF');
        secondsToTime(94.23).should.be.equal('1:34.23');
        secondsToTime(14.56).should.be.equal('14.56');
      });
    });
  });
});
