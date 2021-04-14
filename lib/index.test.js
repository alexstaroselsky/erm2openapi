const _ = require('lodash');
const mongoose = require('mongoose');
const { getModelSchemas, getModelPaths } = require('.');

describe('lib', () => {
  describe('getModelSchemas()', () => {
    beforeEach(() => {
      _.unset(mongoose, 'models.Foo');
      _.unset(mongoose, 'models.Bar');
    });

    it('should generate a schema', () => {
      const schema = getModelSchemas({
        model: mongoose.model('Foo', {
          name: String,
        }),
      });

      expect(schema).toEqual({
        Foo: {
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

    it('should generate a schema with refs', () => {
      const fooModel = mongoose.model('Foo', {
        name: String,
        bar: { type: mongoose.Schema.Types.ObjectId, ref: 'Bar' },
        bazzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Baz' }],
        barr: { type: 'ObjectId', ref: 'Bar' },
      });
      mongoose.model('Bar', { name: String });
      mongoose.model('Baz', { name: String });

      const schema = getModelSchemas({ model: fooModel });

      expect(schema).toEqual({
        Foo: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            bar: {
              oneOf: [
                {
                  type: 'string',
                },
                {
                  $ref: '#/components/schemas/Bar',
                },
              ],
            },
            bazzes: {
              type: 'array',
              items: {
                oneOf: [
                  {
                    type: 'string',
                  },
                  {
                    $ref: '#/components/schemas/Baz',
                  },
                ],
              },
            },
            barr: {
              oneOf: [
                {
                  type: 'string',
                },
                {
                  $ref: '#/components/schemas/Bar',
                },
              ],
            },
            _id: {
              type: 'string',
            },
          },
        },
      });
    });

    it('should include description property', () => {
      const schema = getModelSchemas({
        model: mongoose.model('Foo', {
          name: { type: String, required: true, description: 'baz' },
        }),
      });

      expect(schema.Foo.properties.name.description).toEqual('baz');
    });

    it('should allow including custom properties', () => {
      const schema = getModelSchemas({
        model: mongoose.model('Foo', {
          name: { type: String, required: true, bar: 'baz' },
        }),
        options: {
          model: {
            props: ['bar'],
          },
        },
      });

      expect(schema.Foo.properties.name.bar).toEqual('baz');
    });
  });

  describe('getModelPaths()', () => {
    beforeEach(() => {
      _.unset(mongoose, 'models.Foo');
    });

    it('should add path parameters', () => {
      const paths = getModelPaths({
        model: mongoose.model('Foo', {
          name: { type: String, required: true, bar: 'baz' },
        }),
      });
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

      expect(paths['/api/v1/Foo/{id}'].get.parameters).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].post.parameters).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].put.parameters).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].patch.parameters).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].delete.parameters).toEqual(expected);
    });

    it('should add tags', () => {
      const paths = getModelPaths({
        model: mongoose.model('Foo', {
          name: { type: String, required: true, bar: 'baz' },
        }),
      });
      const expected = ['Foo'];

      expect(paths['/api/v1/Foo'].get.tags).toEqual(expected);
      expect(paths['/api/v1/Foo'].post.tags).toEqual(expected);

      expect(paths['/api/v1/Foo/count'].get.tags).toEqual(expected);

      expect(paths['/api/v1/Foo/{id}'].get.tags).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].post.tags).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].put.tags).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].patch.tags).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].delete.tags).toEqual(expected);
    });

    it('should add default error', () => {
      const paths = getModelPaths({
        model: mongoose.model('Foo', {
          name: { type: String, required: true, bar: 'baz' },
        }),
      });
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

      expect(paths['/api/v1/Foo'].get.responses.default).toEqual(expected);
      expect(paths['/api/v1/Foo'].post.responses.default).toEqual(expected);

      expect(paths['/api/v1/Foo/count'].get.responses.default).toEqual(
        expected,
      );

      expect(paths['/api/v1/Foo/{id}'].get.responses.default).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].post.responses.default).toEqual(
        expected,
      );
      expect(paths['/api/v1/Foo/{id}'].put.responses.default).toEqual(expected);
      expect(paths['/api/v1/Foo/{id}'].patch.responses.default).toEqual(
        expected,
      );
      expect(paths['/api/v1/Foo/{id}'].delete.responses.default).toEqual(
        expected,
      );
    });
  });
});
