const inquirer = require("inquirer");

function selectBookFromList(list) {
  const questions = [
    {
      message: 'Select on option to remove from the `to read` list:',
      name: 'toRemove',
      type: 'list',
      choices: ['None', ...list],
    },
  ];

  return inquirer.prompt(questions);
}

module.exports = selectBookFromList;
