const _ = require('lodash');
const m2s = require('mongoose-to-swagger');

const queryParameters = [
  {
    name: 'sort',
    in: 'query',
    schema: {
      type: 'string',
    },
  },
  {
    name: 'skip',
    in: 'query',
    schema: {
      type: 'number',
    },
  },
  {
    name: 'limit',
    in: 'query',
    schema: {
      type: 'number',
    },
  },
  {
    name: 'query',
    in: 'query',
    schema: {
      type: 'string',
    },
  },
  {
    name: 'populate',
    in: 'query',
    schema: {
      type: 'string',
    },
  },
  {
    name: 'select',
    in: 'query',
    schema: {
      type: 'string',
    },
  },
  {
    name: 'distinct',
    in: 'query',
    schema: {
      type: 'string',
    },
  },
];

const pathParamaters = [
  {
    name: 'id',
    in: 'path',
    required: true,
    schema: {
      type: 'string',
    },
  },
];

const countSchema = {
  type: 'object',
  properties: {
    count: {
      type: 'number',
    },
  },
  required: ['count'],
};

const errors = {
  default: {
    description: 'Unexpected Error',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/error',
        },
      },
    },
  },
  badRequest: {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/error',
        },
      },
    },
  },
  notFound: {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/error',
        },
      },
    },
  },
};

const getOperationId = ({ method = 'get', model, id = false, subcommand }) => {
  const operation = {
    get: 'get',
    post: id ? 'update' : 'create',
    put: 'replace',
    patch: 'patch',
    delete: 'delete',
  };

  const prefix = operation[method.toLowerCase()];
  const suffix = method === 'get' && id ? 'byId' : '';
  const parts = [prefix, _.startCase(model), suffix, subcommand];

  return _.chain(parts).compact().join(' ').camelCase().value();
};

const getModelSchemas = ([
  key,
  { model, options: { model: modelOptions } = {} },
]) => {
  const { title, ...rest } = m2s(model, modelOptions);
  return {
    [key]: {
      type: 'object',
      ...rest,
    },
  };
};

const getModelPaths = (
  [
    key,
    {
      options: {
        erm: { prefix = '/api', version = '/v1' } = {},
        openapi: { paths: modelPathOverrides = {} } = {},
      } = {},
    } = {},
  ],
  { openapi: { paths: globalPathOverrides = {} } = {} } = {},
) => {
  const pathPrefix = `${prefix}${version}/${key}`;

  return {
    [pathPrefix]: {
      get: {
        summary: `Query ${key}`,
        operationId: getOperationId({ model: key }),
        tags: [key],
        parameters: [...queryParameters],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: `#/components/schemas/${key}`,
                  },
                },
              },
            },
          },
          400: {
            ...errors.badRequest,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
      post: {
        summary: `Create new ${key}`,
        operationId: getOperationId({ method: 'post', model: key }),
        tags: [key],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${key}`,
              },
            },
          },
          required: true,
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${key}`,
                },
              },
            },
          },
          400: {
            ...errors.badRequest,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
    },
    [`${pathPrefix}/count`]: {
      get: {
        summary: `Get ${key} count`,
        operationId: getOperationId({
          model: key,
          subcommand: 'count',
        }),
        tags: [key],
        parameters: [...queryParameters],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  ...countSchema,
                },
              },
            },
          },
          400: {
            ...errors.badRequest,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
    },
    [`${pathPrefix}/{id}`]: {
      get: {
        summary: `Get ${key} by id`,
        operationId: getOperationId({ model: key, id: true }),
        tags: [key],
        parameters: [...pathParamaters],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${key}`,
                },
              },
            },
          },
          404: {
            ...errors.notFound,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
      post: {
        summary: `Update ${key} by id`,
        operationId: getOperationId({
          method: 'post',
          id: true,
          model: key,
        }),
        tags: [key],
        parameters: [...pathParamaters],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${key}`,
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${key}`,
                },
              },
            },
          },
          400: {
            ...errors.badRequest,
          },
          404: {
            ...errors.notFound,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
      put: {
        summary: `Update ${key} by id`,
        operationId: getOperationId({
          method: 'put',
          id: true,
          model: key,
        }),
        tags: [key],
        parameters: [...pathParamaters],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${key}`,
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${key}`,
                },
              },
            },
          },
          400: {
            ...errors.badRequest,
          },
          404: {
            ...errors.notFound,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
      patch: {
        summary: `Update ${key} by id`,
        operationId: getOperationId({
          method: 'patch',
          id: true,
          model: key,
        }),
        tags: [key],
        parameters: [...pathParamaters],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${key}`,
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${key}`,
                },
              },
            },
          },
          400: {
            ...errors.badRequest,
          },
          404: {
            ...errors.notFound,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
      delete: {
        summary: `Delete ${key} by id`,
        operationId: getOperationId({
          method: 'delete',
          model: key,
          id: true,
        }),
        tags: [key],
        parameters: [...pathParamaters],
        responses: {
          204: {
            description: 'Deleted',
          },
          404: {
            ...errors.notFound,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
    },
    [`${pathPrefix}/{id}/shallow`]: {
      get: {
        summary: `Get ${key} by id shallow`,
        operationId: getOperationId({
          model: key,
          id: true,
          subcommand: 'shallow',
        }),
        tags: [key],
        parameters: [...pathParamaters],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${key}`,
                },
              },
            },
          },
          404: {
            ...errors.notFound,
          },
          default: {
            ...errors.default,
          },
        },
        ...globalPathOverrides,
        ...modelPathOverrides,
      },
    },
  };
};

const getModelSegments = (model, options) => ({
  schemas: getModelSchemas(model, options),
  paths: getModelPaths(model, options),
});

module.exports = {
  getModelSchemas,
  getModelSegments,
  getOperationId,
  getModelPaths,
};
