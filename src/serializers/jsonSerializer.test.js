/* eslint-disable no-shadow */
/* eslint-disable arrow-parens */
const { test } = require('zora');
const JsonSerializer = require('./jsonSerializer');

const payload = { foo: 'bar' };

module.exports = test('jsonSerializer', t => {
  t.test('when an object is serialized', t => {
    const serializer = new JsonSerializer();
    const result = serializer.serialize(payload);
    t.equal(result.length, 13, 'it has the correct length');
    t.equal(serializer.deserialize(result), payload, 'deserializes to the same object');
  });
});
