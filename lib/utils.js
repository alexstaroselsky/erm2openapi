// https://github.com/giddyinc/mongoose-to-swagger/blob/master/lib/index.ts

const _ = require('lodash');
const { ObjectId } = require('bson');

const mapMongooseTypeToSwaggerType = (type, { ref } = {}) => {
  if (!type) {
    return null;
  }

  if (
    type === Number ||
    (_.isString(type) && type.toLowerCase() === 'number')
  ) {
    return 'number';
  }

  if (
    type === String ||
    (_.isString(type) && type.toLowerCase() === 'string')
  ) {
    return 'string';
  }

  if (type.schemaName === 'Mixed') {
    return 'object';
  }

  if (type === 'ObjectId' || type === 'ObjectID') {
    if (ref) {
      return {
        oneOf: [{ type: 'string' }, { $ref: `#/components/schemas/${ref}` }],
      };
    }

    return 'string';
  }

  if (type === ObjectId) {
    if (ref) {
      return {
        oneOf: [{ type: 'string' }, { $ref: `#/components/schemas/${ref}` }],
      };
    }

    return 'string';
  }

  if (
    type === Boolean ||
    (_.isString(type) && type.toLowerCase() === 'boolean')
  ) {
    return 'boolean';
  }

  if (type === Map) {
    return 'map';
  }

  if (type instanceof Function) {
    // special types
    if (type.name === 'ObjectId' || type.name === 'ObjectID') {
      if (ref) {
        return {
          oneOf: [{ type: 'string' }, { $ref: `#/components/schemas/${ref}` }],
        };
      }

      return 'string';
    }

    if (type.name === 'Date') {
      return 'string';
    }

    if (type.name === 'Decimal128') {
      return 'number';
    }

    return type.name.toLowerCase();
  }

  if (type.type != null) {
    return mapMongooseTypeToSwaggerType(type.type, type);
  }

  if (type.instance) {
    switch (type.instance) {
      case 'Array':
      case 'DocumentArray':
        return 'array';
      case 'ObjectId':
      case 'ObjectID':
      case 'SchemaDate':
        return 'string';
      case 'Mixed':
        return 'object';
      case 'String':
      case 'SchemaString':
      case 'SchemaBuffer':
      case 'SchemaObjectId':
        return 'string';

      case 'SchemaArray':
        return 'array';
      case 'Boolean':
      case 'SchemaBoolean':
        return 'boolean';
      case 'Number':
      case 'Decimal128':
      case 'SchemaNumber':
        return 'number';
      default:
    }
  }

  if (Array.isArray(type)) {
    return 'array';
  }

  if (type.$schemaType) {
    return mapMongooseTypeToSwaggerType(type.$schemaType.tree);
  }

  if (type.getters && Array.isArray(type.getters) && type.path != null) {
    return null; // virtuals should not render
  }

  return 'object';
};

const defaultSupportedMetaProps = ['enum', 'required', 'description'];

const mapSchemaTypeToFieldSchema = ({
  key = null, // null = array field
  value,
  props,
}) => {
  const swaggerType = mapMongooseTypeToSwaggerType(value);
  const meta = {};

  for (const metaProp of props) {
    if (value && value[metaProp] != null) {
      meta[metaProp] = value[metaProp];
    }
  }

  if (value === Date || value.type === Date) {
    meta.format = 'date-time';
  } else if (swaggerType === 'array') {
    const arraySchema = Array.isArray(value) ? value[0] : value.type[0];
    const items = mapSchemaTypeToFieldSchema({
      value: arraySchema || {},
      props,
    });
    meta.items = items;
  } else if (swaggerType === 'object') {
    let fields = [];
    if (value && value.constructor && value.constructor.name === 'Schema') {
      fields = getFieldsFromMongooseSchema(value, { props });
    } else {
      const subSchema = value.type ? value.type : value;
      if (subSchema.obj && Object.keys(subSchema.obj).length > 0) {
        fields = getFieldsFromMongooseSchema(
          { tree: subSchema.tree ? subSchema.tree : subSchema },
          { props },
        );
      } else if (subSchema.schemaName !== 'Mixed') {
        fields = getFieldsFromMongooseSchema(
          { tree: subSchema.tree ? subSchema.tree : subSchema },
          { props },
        );
      }
    }

    const properties = {};

    for (const field of fields.filter(f => f.type != null)) {
      properties[field.field] = field;
      delete field.field;
    }

    meta.properties = properties;
  } else if (swaggerType === 'map') {
    const subSchema = mapSchemaTypeToFieldSchema({
      value: value.of || {},
      props,
    });
    // swagger defines map as an `object` type
    meta.type = 'object';
    // with `additionalProperties` instead of `properties`
    meta.additionalProperties = subSchema;
  }

  const result = {
    ...(_.has(swaggerType, 'oneOf') ? swaggerType : { type: swaggerType }),
    ...meta,
  };

  if (key) {
    result.field = key;
  }

  return result;
};

const getFieldsFromMongooseSchema = (schema, options) => {
  const { props } = options;
  const tree = schema.tree;
  const keys = Object.keys(schema.tree);
  const fields = [];

  // loop over the tree of mongoose schema types
  // and return an array of swagger fields
  for (const key of keys.filter(x => x != 'id')) {
    const value = tree[key];

    // swagger object
    const field = mapSchemaTypeToFieldSchema({ key, value, props });
    const required = [];

    if (field.type === 'object') {
      const { field: propName } = field;
      const fieldProperties = field.properties || field.additionalProperties;
      for (const f of Object.values(fieldProperties)) {
        if (f.required && propName != null) {
          required.push(propName);
          delete f.required;
        }
      }
    }

    if (field.type === 'array' && field.items.type === 'object') {
      field.items.required = [];
      for (const key in field.items.properties) {
        const val = field.items.properties[key];
        if (val.required) {
          field.items.required.push(key);
          delete val.required;
        }
      }
    }

    fields.push(field);
  }

  return fields;
};

/**
 * Entry Point
 * @param Model Mongoose Model Instance
 */
function m2s(Model, options = {}) {
  let { props = [], omitFields = [] } = options;
  props = [...defaultSupportedMetaProps, ...props];

  let omitted = new Set(['__v', ...omitFields]);
  const removeOmitted = swaggerFieldSchema => {
    return (
      (swaggerFieldSchema.type != null || swaggerFieldSchema.oneOf !== null) &&
      !omitted.has(swaggerFieldSchema.field)
    );
  };

  // console.log('swaggering', Model.modelName);
  const schema = Model.schema;

  // get an array of deeply hydrated fields
  const fields = getFieldsFromMongooseSchema(schema, { props });

  // root is always an object
  const obj = {
    title: Model.modelName,
    required: [],
    properties: {},
  };

  // key deeply hydrated fields by field name
  for (const field of fields.filter(removeOmitted)) {
    const { field: fieldName } = field;
    delete field.field;
    obj.properties[fieldName] = field;
    if (field.required && fieldName != null) {
      obj.required.push(fieldName);
      delete field.required;
    }
  }

  if (!obj.required || !obj.required.length) {
    delete obj.required;
  }

  return obj;
}

m2s.adjustType = mapMongooseTypeToSwaggerType;
m2s.getFieldsFromMongooseSchema = getFieldsFromMongooseSchema;

module.exports = {
  m2s,
};
