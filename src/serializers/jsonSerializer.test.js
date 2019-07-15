/* eslint-disable no-shadow */
/* eslint-disable arrow-parens */
const { test } = require('zora');
const JsonSerializer = require('./jsonSerializer');

const payload = { foo: 'bar' };

test('jsonSerializer', t => {
  t.test('when an object is serialized', t => {
    const serializer = new JsonSerializer();
    const result = serializer.serialize(payload);
    t.equal(result.length, 15, 'it has the correct length');
    t.equal(serializer.deserialize(result), payload, 'deserializes to the same object');
  });

  t.test('when an object is deserialized', t => {
    const serializer = new JsonSerializer();
    const serializedPayload = serializer.serialize(payload);
    const result = serializer.deserialize(serializedPayload);
    t.equal(result, payload, 'the result is the same as the original input');
  });
});
