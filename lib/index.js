const _ = require('lodash');
const m2s = require('mongoose-to-swagger');
const { getErrorResponses } = require('./errors');
const { getQueryParameters, getPathParameters } = require('./parameters');
const { getOperationId } = require('./operations');

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
        parameters: getQueryParameters(),
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
          ...getErrorResponses([400]),
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
          ...getErrorResponses([400]),
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
        parameters: getQueryParameters(),
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: {
                      type: 'number',
                    },
                  },
                  required: ['count'],
                },
              },
            },
          },
          ...getErrorResponses([400]),
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
        parameters: getPathParameters(),
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
          ...getErrorResponses([400, 404]),
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
        parameters: getPathParameters(),
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
          ...getErrorResponses([400, 404]),
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
        parameters: getPathParameters(),
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
          ...getErrorResponses([400, 404]),
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
        parameters: getPathParameters(),
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
          ...getErrorResponses([400, 404]),
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
        parameters: getPathParameters(),
        responses: {
          204: {
            description: 'Deleted',
          },
          ...getErrorResponses([404]),
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
        parameters: getPathParameters(),
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
          ...getErrorResponses([404]),
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
