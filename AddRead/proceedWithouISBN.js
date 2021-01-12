const inquirer = require("inquirer");

function getUserInput() {
  const questions = [
    {
      message: 'Proceed without ISBN? No data will be fetched',
      name: 'ignoreIsbn',
      type: 'confirm',
    },
  ];

  return inquirer.prompt(questions);
}

module.exports = getUserInput;
