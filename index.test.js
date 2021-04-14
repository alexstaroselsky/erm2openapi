const mongoose = require('mongoose');
const validator = require('oas-validator');
const { createGraphQLSchema } = require("openapi-to-graphql");
const erm2openapi = require('.');
const document = require('./test/fixtures/api-docs.json');

const personSchema = mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'story' }],
});
const storySchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'person' },
  title: { type: String, required: true },
  fans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'person' }],
});
const story = mongoose.model('story', storySchema);
const person = mongoose.model('person', personSchema);

const models = {
  story: {
    model: story,
    options: {
      model: {
        props: ['bar'],
      },
    },
  },
  person: {
    model: person,
  },
};

describe('erm2openapi', () => {
  it('should create an OpenAPI object', () => {
    const actual = erm2openapi(
      {
        info: { title: 'Test service', version: '1.0.0' },
      },
      models,
    );

    expect(actual).toEqual(document);
  });

  it('should be a valid OpenAPI document', async () => {
    const oas = erm2openapi(
      {
        info: { title: 'Test service', version: '1.0.0' },
      },
      models,
    );

    const { valid } = await validator.validate(oas, {});
    expect(valid).toEqual(true);
  });

  it('should work with other tools', async () => {
    const oas = erm2openapi(
      {
        info: { title: 'Test service', version: '1.0.0' },
      },
      models,
    );

    const { schema, report } = await createGraphQLSchema(oas);
  });
});
