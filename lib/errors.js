const getErrors = () => ({
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
  400: {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/error',
        },
      },
    },
  },
  404: {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/error',
        },
      },
    },
  },
});

const getErrorResponses = (codes = []) =>
  [...codes, 'default'].reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: getErrors()[curr],
    }),
    {},
  );

module.exports = {
  getErrorResponses,
};
