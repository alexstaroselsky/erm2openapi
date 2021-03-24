const { getErrorResponses } = require('./errors');

describe('lib', () => {
  describe('getErrorResponses()', () => {
    it('should return default error response', () => {
      expect(getErrorResponses()).toHaveProperty('default');
    });
  });
});