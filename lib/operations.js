const _ = require('lodash');

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

module.exports = {
  getOperationId,
};
