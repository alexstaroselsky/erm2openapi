const _ = require('lodash');
const { getModelSegments } = require('./lib');

/**
 * Generate OpenAPI document for an express-restify-mongoose (ERM) server from
 * Mongoose models.
 *
 * @param {object} base Base OpenAPI object
 * @param {string} [base.openapi='3.0.3'] OpenAPI version
 * @param {{ name: string, description: string, externalDocs: Object }[]} [base.tags=[]] tags
 * @param {Object.<string, object>} [base.paths={}] paths paths/routes
 * @param {Object.<string, object>} [base.components={}] paths paths/routes
 * @param {Object.<string, { model: Object, options: Object }>} models Mongoose model and options keyed by name
 * @param {Object} [options={}] global options
 * @param {Object} [options.openapi={}] global openapi options
 * @param {Object} [options.openapi.path={}] global openapi path options
 * @param {Object} [options.openapi.path.security=[]] global openapi security options
 * @returns {Object} OpenAPI object
 */
const erm2openapi = (
  { openapi = '3.0.3', tags = [], paths = {}, components = {}, ...rest } = {},
  models = {},
  options = {},
) => {
  const document = {
    openapi,
    tags,
    paths,
    components: {
      ...components,
      schemas: {
        ...components.schemas,
        error: {
          required: ['name', 'message'],
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
    ...rest,
  };

  return Object.values(models).reduce((acc, curr) => {
    const { model: { modelName } } = curr;
    const { paths, schemas } = getModelSegments(curr, options);

    return {
      ...acc,
      tags: [
        ...acc.tags,
        { name: modelName, description: `REST interface for ${modelName} model` },
      ],
      paths: {
        ...acc.paths,
        ...paths,
      },
      components: {
        ...acc.components,
        schemas: {
          ...acc.components.schemas,
          ...schemas,
        },
      },
    };
  }, document);
};

module.exports = erm2openapi;
