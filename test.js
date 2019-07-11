/* eslint-disable arrow-parens */

const { test } = require('zora');
const reporter = require('tap-mocha-reporter');

const r = reporter('spec');
test.indent();

// Not happy with intercepting console.log in this way, but couldn't seem to get stdout.pipe working
const originalConsoleLog = console.log;
console.log = msg => {
  const newConsoleLog = console.log;
  console.log = originalConsoleLog;
  r.write(`${msg}\n`);
  console.log = newConsoleLog;
};

require('./src/serializers/jsonSerializer.test');
require('./src/storage/memoryStorage.test');
require('./src/buffr.test');

// Once all of the tests have finished running
process.on('exit', () => {
  console.log = originalConsoleLog;
  r.end();
});
