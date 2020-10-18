const inquirer = require("inquirer");

function getUserInput() {
  const questions = [
    {
      message: 'Enter the book title:',
      name: 'title',
      type: 'input',
    },
    {
      message: 'Enter the book author (Last, First Middle ...):',
      name: 'author',
      type: 'input',
    },
    {
      message: 'Enter the book ISBN:',
      name: 'isbn',
      type: 'number',
    },
    {
      message: 'Enter the date you finished reading the book (YYYYMMDD):',
      name: 'date',
      type: 'number',
    },
    {
      message: 'Enter notes:',
      name: 'notes',
      type: 'input',
    },
    {
      message: 'Enter a review:',
      name: 'review',
      type: 'list',
      choices: ['Neutral', 'Liked', 'Disliked'],
    },
  ];

  return inquirer.prompt(questions);
}

module.exports = getUserInput;
