'use strict';

const { showBanner } = require('../utils/banner');
const fs = require('fs');
const chalk = require('chalk');
const Table = require('cli-table3');

const showCommands = async () => {
  await showBanner();

  if (!fs.existsSync(`${process.cwd()}/config.json`)) {
    console.log(chalk.red("Config file doesn't exist!\n"));
    process.exit(1);
  }

  let userConfig = fs.readFileSync(process.cwd() + '/config.json', 'utf8');
  const { userName, taskCount } = JSON.parse(userConfig);

  console.log();
  console.log(
    chalk.green(
      `User: ${userName}${`\t`.repeat(6)}Progress: ${taskCount + 1}/30`,
    ),
  );
  console.log();

  let commands = new Table();

  commands.push(
    {
      'teachcode init': 'Initialize all the tasks',
    },
    {
      'teachcode fetchtask <key>': 'Fetch new task providing the key',
    },
    {
      'teachcode submit': 'Submits the current file',
    },
    {
      'teachcode showkeys': 'View any tasks by grabbing their keys',
    },
    {
      'teachcode showcommands': 'Lists all the commands',
    },
  );
  console.log(commands.toString());
};

module.exports = showCommands;
