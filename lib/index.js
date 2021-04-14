const _ = require('lodash');
const { getErrorResponses } = require('./errors');
const { getQueryParameters, getPathParameters } = require('./parameters');
const { getOperationId } = require('./operations');
const { m2s } = require('./utils');

const getModelSchemas = ({ model, options: { model: modelOptions } = {} }) => {
  const { modelName } = model;
  const { title, ...rest } = m2s(model, modelOptions);
  return {
    [modelName]: {
      type: 'object',
      ...rest,
    },
  };
};

const getModelPaths = (
  {
    model: { modelName },
    options: {
      erm: { prefix = '/api', version = '/v1' } = {},
      openapi: { paths: modelPathOverrides = {} } = {},
    } = {},
  } = {},
  { openapi: { paths: globalPathOverrides = {} } = {} } = {},
) => {
  const pathPrefix = `${prefix}${version}/${modelName}`;

  return {
    [pathPrefix]: {
      get: {
        summary: `Query ${modelName}`,
        operationId: getOperationId({ model: modelName }),
        tags: [modelName],
        parameters: getQueryParameters(),
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: `#/components/schemas/${modelName}`,
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
        summary: `Create new ${modelName}`,
        operationId: getOperationId({ method: 'post', model: modelName }),
        tags: [modelName],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${modelName}`,
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
                  $ref: `#/components/schemas/${modelName}`,
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
        summary: `Get ${modelName} count`,
        operationId: getOperationId({
          model: modelName,
          subcommand: 'count',
        }),
        tags: [modelName],
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
        summary: `Get ${modelName} by id`,
        operationId: getOperationId({ model: modelName, id: true }),
        tags: [modelName],
        parameters: getPathParameters(),
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${modelName}`,
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
        summary: `Update ${modelName} by id`,
        operationId: getOperationId({
          method: 'post',
          id: true,
          model: modelName,
        }),
        tags: [modelName],
        parameters: getPathParameters(),
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${modelName}`,
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
                  $ref: `#/components/schemas/${modelName}`,
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
        summary: `Update ${modelName} by id`,
        operationId: getOperationId({
          method: 'put',
          id: true,
          model: modelName,
        }),
        tags: [modelName],
        parameters: getPathParameters(),
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${modelName}`,
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
                  $ref: `#/components/schemas/${modelName}`,
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
        summary: `Update ${modelName} by id`,
        operationId: getOperationId({
          method: 'patch',
          id: true,
          model: modelName,
        }),
        tags: [modelName],
        parameters: getPathParameters(),
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${modelName}`,
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
                  $ref: `#/components/schemas/${modelName}`,
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
        summary: `Delete ${modelName} by id`,
        operationId: getOperationId({
          method: 'delete',
          model: modelName,
          id: true,
        }),
        tags: [modelName],
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
        summary: `Get ${modelName} by id shallow`,
        operationId: getOperationId({
          model: modelName,
          id: true,
          subcommand: 'shallow',
        }),
        tags: [modelName],
        parameters: getPathParameters(),
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${modelName}`,
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

const getModelSegments = (input, options) => ({
  schemas: getModelSchemas(input, options),
  paths: getModelPaths(input, options),
});

module.exports = {
  getModelSchemas,
  getModelSegments,
  getOperationId,
  getModelPaths,
};
