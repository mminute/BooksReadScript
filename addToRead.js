// To run: node addBook.js
// See addRead.js as it was used as a guide for this file

const inquirer = require('inquirer');
const booksToReadData = require('./OUTPUT/booksToRead');
const writeFile = require('./utils/writeFile');
const writeToWebsite = require('./utils/writeToWebsite');

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

function printUserInput({ author, link, title }) {
  console.log('===================================');
  console.log('===================================');
  console.log(`Title: ${title}`);
  console.log(`Author: ${author}`);
  console.log(`Link: ${link}`);
  console.log('===================================');
  console.log('===================================');
}

function confirmInput() {
  return inquirer.prompt([
    {
      message: 'Is this information correct?',
      name: 'confirm',
      type: 'confirm',
    },
  ]);
}

const run = async () => {
  const { author, link, title } = await getUserInput();
  printUserInput({ author, link, title });
  const { confirm: inputConfirmed } = await confirmInput();

  if (!inputConfirmed) {
    return;
  }

  // TODO: Check to prevent duplicates

  const data = { author, link, title, added: new Date() };

  const allData = [...booksToReadData, data];

  const contents = `module.exports = ${JSON.stringify(allData)};`;

  writeFile('./OUTPUT/booksToRead.js', contents);
  writeToWebsite('toRead', contents);
};

run();
