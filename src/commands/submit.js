'use strict';

const { showBanner } = require('../utils/banner');
const { PythonShell } = require('python-shell');
const { exec } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');
const program = require('commander');
const shell = require('shelljs');

const keyStore = '123456789abcedefghijklmnopqrstuvwxyz';

let exercises;
let userData;
let generatedKey;
let solutionFile;
let fileExtension;

const generateKey = () => {
  let key = '';
  for (let i = 0; i < 36; i++)
    key += keyStore.charAt(Math.floor(Math.random() * keyStore.length));
  return key;
};

// Keywords for validating solutions
const validationKeys = [
  'len',
  '/3',
  'if',
  'for',
  'while',
  'for',
  'if',
  '/3',
  '/2',
  'strip',
  ':',
  ':',
  'def',
  'if',
  'return',
  'asctime',
  'math.sqrt',
  '[',
  '[',
  'append',
  'else',
  '{',
  'except',
  'return',
  'range',
  'for',
  '%',
  '[::',
];

const pushToRepo = async task => {
  let commitMsg = `solution for task${task}.${fileExtension}`;

  const gitCommands = [
    'git add --all',
    `git commit -m "${commitMsg}"`,
    'git push origin master',
  ];

  gitCommands.map(async command => {
    await shell.exec(command, { silent: true }, err => {
      if (err) throw err;
    });
  });
};

const checkSolution = async (
  submittedFileContent,
  solutionFileContent,
  taskCount,
  keys,
) => {
  try {
    if (submittedFileContent.toString() === solutionFileContent.toString()) {
      taskCount += 1;

      try {
        await pushToRepo(taskCount);
      } catch (err) {
        throw err;
      }
      if (taskCount === exercises.length) {
        console.log(chalk.greenBright("\n  Hurray you've done it!\n"));
        console.log(
          chalk.cyanBright(' Info: ') +
            chalk.yellowBright('No more tasks available!'),
        );
        process.exit(1);
      }

      generatedKey = generateKey();

      keys.push(generatedKey);

      fs.writeFileSync(process.cwd() + '/config.json', userData);
      console.log(
        chalk.greenBright(
          "\n  Hurray you've done it!\n  Key to access the next task: " +
            generatedKey +
            '\n',
        ),
      );
    } else {
      console.log(
        chalk.yellowBright(
          "\n  The solution doesn't meet all the output requirements. Have a look again!\n",
        ),
      );
    }
  } catch (err) {
    console.log(
      chalk.red(
        `\n There's something wrong with the file task${taskCount +
          1}.${fileExtension}\n`,
      ),
    );
    console.log('\n' + err);
  }
};

const validateSolution = (track, taskCount, solutionFile) => {
  let fileContent = fs.readFileSync(solutionFile, 'utf8').toString();

  // Validation for tasks submitted
  if (track === 'Python') {
    if (taskCount >= 2) {
      if (fileContent.includes(validationKeys[taskCount - 2])) {
        return;
      } else {
        console.log(
          chalk.red.bold(
            '\n Make sure that you use the required constructs as provided',
          ),
        );
        process.exit(1);
      }
    }
  } else {
    // TODO: Validation for JS solutions
  }
};

const submitTask = async () => {
  await showBanner();
  if (program.args.length > 1) {
    console.log(
      chalk.red(`\n ${chalk.yellow('submit')} don't take in any arguments`),
    );
    process.exit(1);
  }

  if (!fs.existsSync(process.cwd() + '/config.json')) {
    console.log(
      chalk.red(
        ' Make sure that you are within the Teach-Code-solutions directory!\n',
      ),
    );
    console.log(
      chalk.magentaBright('\tcd Teach-Code-solutions may resolve the issue!\n'),
    );
    process.exit(1);
  }

  userData = fs.readFileSync(process.cwd() + '/config.json', 'utf8');
  const { keys, userName, userSubmittedFiles, track, taskCount } = JSON.parse(
    userData,
  );

  if (track === 'Python') {
    exercises = require('../workspace/python/tasks');
    solutionFile = __dirname + '/../workspace/python' + exercises[taskCount].op;
    fileExtension = 'py';
  } else {
    exercises = require('../workspace/js/tasks');
    solutionFile = __dirname + '/../workspace/js' + exercises[taskCount].op;
    fileExtension = 'js';
  }

  if (taskCount !== exercises.length) {
    console.log(
      chalk.green(
        `\nUser: ${userName}${`\t`.repeat(6)}Progress: ${taskCount + 1}/${
          exercises.length
        }`,
      ),
    );
  } else {
    console.log(
      chalk.greenBright(
        `\n  Congrats ${userName} you've made it through!\n  All tasks completed!\n`,
      ),
    );
    process.exit(1);
  }

  if (!userSubmittedFiles.length) {
    console.log(chalk.red('\n Use fetchtask to fetch your very first task'));
    process.exit(1);
  }

  if (taskCount === userSubmittedFiles.length) {
    console.log(chalk.yellow('\nTask already submitted!\n'));
    process.exit(1);
  }

  let submittedFile = userSubmittedFiles.slice(-1).pop();
  let submittedFileContent = fs
    .readFileSync(submittedFile, 'utf8')
    .toString()
    .split('');

  if (!submittedFileContent.length) {
    console.log(
      chalk.red(
        `\n Solution file task${taskCount + 1}.${fileExtension} is empty!\n`,
      ),
    );
    process.exit(1);
  }

  if (track === 'Python') {
    PythonShell.run(submittedFile, null, (err, result) => {
      if (err) {
        console.log(
          chalk.red(
            '\n\tOops there is something wrong with the syntax part!\n',
          ),
        );
        console.log(err.toString());
        process.exit(1);
      }

      PythonShell.run(solutionFile, null, (err, solution) => {
        if (err) {
          console.log(chalk.red('  ' + err.toString()));
          process.exit(1);
        }

        if (typeof result === 'undefined' || typeof solution === 'undefined') {
          console.log(
            chalk.red(
              `\n Kindly have a look at task${taskCount}.${fileExtension}`,
            ),
          );
          process.exit(1);
        }
        validateSolution(track, taskCount, submittedFile);
        checkSolution(result, solution, taskCount, keys);
      });
    });
  } else {
    exec(`node ${submittedFile}`, (err, result) => {
      if (err) throw err;
      exec(`node ${solutionFile}`, (err, solution) => {
        if (err) throw err;
        validateSolution(track, taskCount, submittedFile);
        checkSolution(result, solution, taskCount, keys);
      });
    });
  }
};

module.exports = submitTask;
