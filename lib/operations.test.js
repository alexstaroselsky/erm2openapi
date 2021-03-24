const { getOperationId } = require('./operations');

describe('lib', () => {
  describe('getOperationId()', () => {
    it('should generate operation id', () => {
      [
        [{ model: 'foo' }, 'getFoo'],
        [{ model: 'foo', id: true }, 'getFooById'],
        [{ method: 'post', model: 'foo' }, 'createFoo'],
        [{ method: 'post', model: 'foo', id: true }, 'updateFoo'],
        [{ method: 'put', model: 'foo', id: true }, 'replaceFoo'],
        [{ method: 'patch', model: 'foo', id: true }, 'patchFoo'],
        [{ method: 'delete', model: 'foo', id: true }, 'deleteFoo'],
        [{ model: 'foo', subcommand: 'count' }, 'getFooCount'],
        [
          { model: 'foo', id: true, subcommand: 'shallow' },
          'getFooByIdShallow',
        ],
      ].forEach(([args, expected]) =>
        expect(getOperationId(args)).toEqual(expected),
      );
    });
  });
});
