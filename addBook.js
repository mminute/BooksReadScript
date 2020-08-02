#!/usr/bin/env node

/*
  To run: node addBook.js
*/

const inquirer = require("inquirer");
const getHashCode = require('./utils/getHashCode.js');
const getGoogleCachePath = require('./utils/getGoogleCachePath');
const fs = require('fs');
const fetch = require('node-fetch');
const writeFile = require('./utils/writeFile');

const testing = true;

function isValidIsbn(isbn) {
  return !isNaN(isbn) && [10, 13].includes(isbn.length);
}

function processDate(rawDate) {
  if (isNaN(rawDate)) {
    return null;
  }

  const matches = rawDate.toString().match(/(\d{4})(\d{2})(\d{2})/);

  if (!matches) {
    console.log('no matches');
    return null;
  }

  const [_, _year, _month, _day] = matches;
  const yearInt = parseInt(_year);
  const monthInt = parseInt(_month);
  const dayInt = parseInt(_day);

  if (yearInt < 2020 || yearInt > 2100) {
    console.log('Invalid year');
    return null;
  }

  if (monthInt < 1 || monthInt > 12) {
    console.log('Invalid month');
    return null;
  }

  if (dayInt < 1 || dayInt > 31) {
    console.log('Invalid day');
    return null;
  }

  const readDate = Date.parse(`${_year}-${_month}-${_day}T00:00:00`);

  if (isNaN(readDate)) {
    console.log('Invalid date object');
    return null;
  }

  return new Date(readDate);
}

function printUserInput({ author, date, isbn, title }) {
  console.log('===================================');
  console.log('===================================');
  console.log(`Title: ${title}`);
  console.log(`Author: ${author}`);
  console.log(`Date: ${date.toDateString()}`);
  console.log(`ISBN: ${isbn}`)
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

function getUserInput() {
  const questions = [
    {
      message: 'Enter the book title:',
      name: 'title',
      type: 'input',
    },
    {
      message: 'Enter the book author:',
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
  ];

  return inquirer.prompt(questions);
}

const run = async () => {
  // const userInput = await getUserInput();
  // const { author, date: rawDate, isbn, title } = userInput;
  const author = 'helloworld';
  const isbn = 9780804139304;
  const title = 'Zero to One';
  const rawDate = 20200731;

  const readDate = processDate(rawDate);
  if (!readDate) {
    return;
  }

  if (!testing && !isValidIsbn(isbn)) {
    console.log('Invalid ISBN');
    return;
  }

  printUserInput({ author, date: readDate, isbn, title });

  // const { confirm: inputConfirmed } = await confirmInput();

  // console.log(inputConfirmed);

  const hashCode = getHashCode(title);
  const googleCacheFilename = getGoogleCachePath(hashCode);
  console.log(googleCacheFilename);

  // let googleData;
  // const apiPromises = [];

  // if (!fs.existsSync(googleCacheFilename)) {
  //   console.log('file does not exist');
  //   const goolgePromise = fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
  //   .then((res) => {
  //     console.log(`FETCHED Google Books Data`);
  //     return res.json();
  //   }, (e) => {
  //     console.log('FAILED to fetch Google Books Data');
  //     console.log(e);
  //   })
  //   .then((res) => {
  //     const data = res.items[0];
  //     console.log(`writing- ${googleCacheFilename}`)
  //     writeFile(googleCacheFilename, JSON.stringify(data));
  //   });

  //   apiPromises.push(goolgePromise);

  //   // 9780804139304
  // } else {
  //   console.log('file exists');
  //   cachedData = JSON.parse(fs.readFileSync(googleCacheFilename).toString());
  // }

  // Fetch data similar to script.js and write the data to files
};

run();

// https://codeburst.io/building-a-node-js-interactive-cli-3cb80ed76c86
// https://medium.com/skilllane/build-an-interactive-cli-application-with-node-js-commander-inquirer-and-mongoose-76dc76c726b6
// https://www.npmjs.com/package/inquirer