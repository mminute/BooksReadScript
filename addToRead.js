// To run: node addBook.js
// See addRead.js as it was used as a guide for this file

const inquirer = require('inquirer');
const booksToReadData = require('./OUTPUT/booksToRead');
const writeFile = require('./utils/writeFile');

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
      message: 'Enter a link:',
      name: 'link',
      type: 'input',
    },
  ];

  return inquirer.prompt(questions);
}

const run = async () => {
  const { author, link, title } = await getUserInput();

  const data = { author, link, title, added: new Date() };

  const allData = [...booksToReadData, data];

  writeFile('./OUTPUT/booksToRead.js', `module.exports = ${JSON.stringify(allData)};`);
  // TODO: Also save to my website
};

run();
