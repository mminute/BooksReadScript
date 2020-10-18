// To run: node addBook.js
// See addRead.js as it was used as a guide for this file

const inquirer = require('inquirer');
const addNewTags = require('./AddRead/addNewTags');
const booksToReadData = require('./OUTPUT/booksToRead');
const crossCheckBooksToRead = require('./AddRead/crossCheckBooksToRead');
const getUserTags = require('./AddRead/getUserTags');
const processTags = require('./AddRead/processTags');
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

function printUserInput({ author, link, tags, title }) {
  console.log('===================================');
  console.log('===================================');
  console.log(`Title: ${title}`);
  console.log(`Author: ${author}`);
  console.log(`Tags: ${tags.join(', ')}`);
  console.log(`Link: ${link}`);
  console.log('===================================');
  console.log('===================================');
}

function confirmInput() {
  return inquirer.prompt([
    {
      message: '\nIs this information correct?',
      name: 'confirm',
      type: 'confirm',
    },
  ]);
}

function printPossibleMatches(matches) {
  console.log('===================================================');
  console.log('POSSIBLE MATCHES FOUND!!!');
  console.log('===================================================');

  matches.forEach((book, idx) => {
    console.log(`${idx + 1}) ${book.title} by ${book.author}\n`);
  });

  console.log('===================================================\n');
}

function confirmBookExists() {
  return inquirer.prompt([
    {
      message: 'IS ONE OF THESE THE BOOK YOU ARE ATTEMPTING TO ADD?',
      name: 'confirm',
      type: 'confirm',
    },
  ]);
}

const run = async () => {
  const { author, link, title } = await getUserInput();
  const { tags } = await getUserTags();
  const { cleanTags, newTags } = await processTags(tags);
  printUserInput({ author, link, tags: cleanTags, title });

  const { confirm: inputConfirmed } = await confirmInput();

  if (!inputConfirmed) {
    return;
  }

  addNewTags(newTags);

  const data = { author, link, tags: cleanTags, title, added: new Date() };

  const matches = crossCheckBooksToRead(data)

  if (matches.length) {
    printPossibleMatches(matches)
    const { confirm: confirmAlreadyExists } = await confirmBookExists();

    if (confirmAlreadyExists) {
      return;
    }
  }

  const allData = [...booksToReadData, data];

  const contents = `module.exports = ${JSON.stringify(allData)};`;

  writeFile('./OUTPUT/booksToRead.js', contents);
  writeToWebsite('toRead', contents);
};

run();
