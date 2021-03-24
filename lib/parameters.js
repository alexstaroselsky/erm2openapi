const getQueryParameters = () => [
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

const getPathParameters = () => [
  {
    name: 'id',
    in: 'path',
    required: true,
    schema: {
      type: 'string',
    },
  },
];

module.exports = {
  getQueryParameters,
  getPathParameters,
};
