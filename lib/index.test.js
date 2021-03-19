const _ = require('lodash');
const mongoose = require('mongoose');
const { getModelSchemas, getOperationId, getModelPaths } = require('.');

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
        [{ model: 'foo', id: true, subcommand: 'shallow' }, 'getFooByIdShallow'],
      ].forEach(([args, expected]) =>
        expect(getOperationId(args)).toEqual(expected),
      );
    });
  });

  describe('getModelSchemas()', () => {
    beforeEach(() => {
      _.unset(mongoose, 'models.Foo');
    });

    it('should generate a schema', () => {
      const schema = getModelSchemas([
        'foo',
        {
          model: mongoose.model('Foo', {
            name: String,
          }),
        },
      ]);

      expect(schema).toEqual({
        foo: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            _id: {
              type: 'string',
            },
          },
        },
      });
    });

    it('should include description property', () => {
      const schema = getModelSchemas([
        'foo',
        {
          model: mongoose.model('Foo', {
            name: { type: String, required: true, description: 'baz' },
          }),
        },
      ]);

      expect(schema.foo.properties.name.description).toEqual('baz');
    });

    it('should allow including custom properties', () => {
      const schema = getModelSchemas([
        'foo',
        {
          model: mongoose.model('Foo', {
            name: { type: String, required: true, bar: 'baz' },
          }),
          options: {
            model: {
              props: ['bar'],
            },
          },
        },
      ]);

      expect(schema.foo.properties.name.bar).toEqual('baz');
    });
  });

  describe('getModelPaths()', () => {
    it('should add path parameters', () => {
      const paths = getModelPaths(['foo']);
      const expected = [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ];

      expect(paths['/api/v1/foo/{id}'].get.parameters).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].post.parameters).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].put.parameters).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].patch.parameters).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].delete.parameters).toEqual(expected);
    });

    it('should add tags', () => {
      const paths = getModelPaths(['foo']);
      const expected = ['foo'];

      expect(paths['/api/v1/foo'].get.tags).toEqual(expected);
      expect(paths['/api/v1/foo'].post.tags).toEqual(expected);

      expect(paths['/api/v1/foo/count'].get.tags).toEqual(expected);

      expect(paths['/api/v1/foo/{id}'].get.tags).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].post.tags).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].put.tags).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].patch.tags).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].delete.tags).toEqual(expected);
    });

    it('should add default error', () => {
      const paths = getModelPaths(['foo']);
      const expected = {
        description: 'Unexpected Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/error',
            },
          },
        },
      };

      expect(paths['/api/v1/foo'].get.responses.default).toEqual(expected);
      expect(paths['/api/v1/foo'].post.responses.default).toEqual(expected);

      expect(paths['/api/v1/foo/count'].get.responses.default).toEqual(
        expected,
      );

      expect(paths['/api/v1/foo/{id}'].get.responses.default).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].post.responses.default).toEqual(
        expected,
      );
      expect(paths['/api/v1/foo/{id}'].put.responses.default).toEqual(expected);
      expect(paths['/api/v1/foo/{id}'].patch.responses.default).toEqual(
        expected,
      );
      expect(paths['/api/v1/foo/{id}'].delete.responses.default).toEqual(
        expected,
      );
    });
  });
});
