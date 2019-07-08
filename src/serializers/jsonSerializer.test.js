const JsonSerializer = require('./jsonSerializer');

const payload = { foo: 'bar' };

describe('given jsonSerializer', () => {
  test('when an object is serialized, it has the correct length and deserializes to the same object', () => {
    const serializer = new JsonSerializer();
    const result = serializer.serialize(payload);
    expect(result.length).toEqual(13);
    expect(serializer.deserialize(result)).toMatchObject(payload);
  });
});
