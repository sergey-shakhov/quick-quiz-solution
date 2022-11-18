import _ from 'lodash';
import { program } from 'commander';
import fs from 'fs';

const commandModules = [
  require('./app.web'),
];

function runApp() {

  _.each(commandModules, (commanModule) => {
    const { initialize } = commanModule;
    initialize(program);
  });

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

process.on('uncaughtException', (err, origin) => {
  fs.writeSync(
    process.stderr.fd,
    `Caught exception: ${err}\n` +
    `Exception origin: ${origin}`
  );
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(2);
});

export {
  runApp
};
