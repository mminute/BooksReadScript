#!/usr/bin/env node

/*
  To run: node addBook.js

  https://codeburst.io/building-a-node-js-interactive-cli-3cb80ed76c86
  https://medium.com/skilllane/build-an-interactive-cli-application-with-node-js-commander-inquirer-and-mongoose-76dc76c726b6
  https://www.npmjs.com/package/inquirer
*/

const c = require('./constants.js');
const fetch = require('node-fetch');
const fictionTags = require('./fictionTags');
const formatGoogleData = require('./utils/formatGoogleData');
const fs = require('fs');
const getGoogleCachePath = require('./utils/getGoogleCachePath');
const getHashCode = require('./utils/getHashCode.js');
const goodreadsHttpsRequest = require('./utils/goodreadsHttpsRequest');
const goodReadsIds = require('./DATA/GoodReadsIds');
const inquirer = require("inquirer");
const writeFile = require('./utils/writeFile');

const testing = true;

const canonicalTags = Object.values(c);

const ReviewMap = {
  Neutral: 0,
  Liked: 1,
  Disliked: -1,
}

async function getValidTag(tag) {
  const { isNewTag } = await inquirer.prompt({
    message: `'${tag}' not found. Is this tag correct?`,
    name: 'isNewTag',
    type: 'confirm',
  });

  if (isNewTag) {
    return tag;
  }

  const { updatedTag } = await inquirer.prompt({
    message: 'Enter the correct tag:',
    name: 'updatedTag',
    type: 'input',
  });

  if (canonicalTags.includes(updatedTag)) {
    return updatedTag;
  } else {
    return await getValidTag(updatedTag);
  }
}

async function fixDirtyTags(dirtyTags) {
  const cleanTags = []
  for (const tag of dirtyTags) {
    const updatedTag = await getValidTag(tag);
    cleanTags.push(updatedTag);
  }

  return cleanTags;
}

async function getNewTagsFiction(newTags) {
  const processed = []
  for (const tag of newTags) {
    const { isFiction } = await inquirer.prompt({
      message: `Is ${tag} a fiction tag?`,
      name: 'isFiction',
      type: 'confirm',
    });

    processed.push({ tag, isFiction });
  }

  return processed;
}

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
    // {
    //   message: 'Enter the book title:',
    //   name: 'title',
    //   type: 'input',
    // },
    // {
    //   message: 'Enter the book author:',
    //   name: 'author',
    //   type: 'input',
    // },
    // {
    //   message: 'Enter the book ISBN:',
    //   name: 'isbn',
    //   type: 'number',
    // },
    // {
    //   message: 'Enter the date you finished reading the book (YYYYMMDD):',
    //   name: 'date',
    //   type: 'number',
    // },
    // {
    //   message: 'Enter notes:',
    //   name: 'notes',
    //   type: 'input',
    // },
    // {
    //   message: 'Enter a review:',
    //   name: 'review',
    //   type: 'list',
    //   choices: ['Neutral', 'Liked', 'Disliked'],
    // },
  ];

  return inquirer.prompt(questions);
}

function getUserTags() {
  const itemsToPrintOnALine = 5;
  const allTags = Object.values(c);
  const maxTagLength = Math.max(...allTags.map(t => t.length));

  let tagsOnLine = itemsToPrintOnALine;
  while (tagsOnLine < allTags.length + itemsToPrintOnALine) {
    // Pretty print all of the existing tags
    const stringLine = allTags.slice(tagsOnLine - 5, tagsOnLine).map((t) => {
      const padding = ' '.repeat((maxTagLength - t.length)/2);
      const str = ` ${padding}${t}${padding} `;
      return str.length === maxTagLength + 2 ? str : str + ' '.repeat(maxTagLength + 2 - str.length);
    }).join('|');

    console.log(stringLine);

    tagsOnLine += itemsToPrintOnALine;
  }

  return inquirer.prompt(
    {
      message: 'Enter a tags (comma separated list):',
      name: 'tags',
      type: 'input',
    },
  );
}

const run = async () => {
  // const userInput = await getUserInput();
  // const { author, date: rawDate, isbn, title } = userInput;
  const { tags } = await getUserTags();
  const author = 'helloworld';
  const isbn = 9780804139304;
  const title = 'Zero to One';
  const rawDate = 20200731;
  const review = 0;
  const notes = '';

  const tagsArr = tags.split(',').map((w) => w.replace(' ', ''));
  let cleanTags = [];
  const dirtyTags = [];
  let newTags;

  tagsArr.forEach((tag) => {
    const collection = canonicalTags.includes(tag) ? cleanTags : dirtyTags;
    collection.push(tag);
  })

  if (dirtyTags.length) {
    const cleansedTags = await fixDirtyTags(dirtyTags);
    
    cleanTags = [...cleanTags, ...cleansedTags];
    if (cleanTags.find(tag => fictionTags.includes(tag)).length) {
      cleanTags.push(c.fiction)
    }

    newTags = await getNewTagsFiction(cleanTags.filter((tag) => !canonicalTags.includes(tag)));
  }

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

  let googleData;
  let goodReadsId;
  const apiPromises = [];

  if (!fs.existsSync(googleCacheFilename)) {
    const goolgePromise = fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    .then((res) => {
      console.log(`FETCHED Google Books Data`);
      return res.json();
    }, (e) => {
      console.log('FAILED to fetch Google Books Data');
      console.log(e);
    })
    .then((res) => {
      const data = res.items[0];
      console.log(`writing- ${googleCacheFilename}`);
      googleDate = data;
      // writeFile(googleCacheFilename, JSON.stringify(data));
    });

    apiPromises.push(goolgePromise);
  } else {
    googleData = JSON.parse(fs.readFileSync(googleCacheFilename).toString());
  }

  if (Object.keys(goodReadsIds).includes(hashCode.toString())) {
    goodReadsId = goodReadsIds[hashCode];
  } else {
    const goodReadsPromise = goodreadsHttpsRequest(isbn, title).then((data) => {
      goodReadsId = data;
    }, (e) => {
      console.log(`REJECTED - ${title}`);
      console.log(`REJECTED- ${e}`);

      goodReadsId = data;
    });

    apiPromises.push(goodReadsPromise);
  }

  Promise.all(apiPromises).then(() => {
    const book = {
      author,
      date: readDate,
      googleData: formatGoogleData(googleData),
      notes: notes.length ? notes : null,
      review: ReviewMap[review],
      tags: Array.from(new Set(cleanTags)),
      title,
      hashCode,
      goodReadsId,
    };

    // TODO: Write the google data file
    // TODO: Add the goodreads id to the goodreads id hash
    // TODO: Update constants.js with new tags
    // TODO: Update fictionTags.js with new tags if needed
    // TODO: separate file with dict of book title hashes and reviews?



    // console.log(book);
  })
};

run();
