#!/usr/bin/env node

/*
  To run: node addBook.js

  https://codeburst.io/building-a-node-js-interactive-cli-3cb80ed76c86
  https://medium.com/skilllane/build-an-interactive-cli-application-with-node-js-commander-inquirer-and-mongoose-76dc76c726b6
  https://www.npmjs.com/package/inquirer
*/

const booksReadRecord = require('./output');
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
const querystring = require('querystring');
const writeFile = require('./utils/writeFile');

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

async function processTags(tags) {
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

    newTags = await getNewTagsFiction(cleanTags.filter((tag) => !canonicalTags.includes(tag)));
  }

  if (cleanTags.find(tag => fictionTags.includes(tag)) || newTags && newTags.find(tag => tag.isFiction)) {
    cleanTags.push(c.fiction)
  }

  cleanTags = Array.from(new Set(cleanTags)); // Remove any duplicates now that your are done adding tags

  return { cleanTags, newTags };
}

function isValidIsbn(isbn) {
  return !isNaN(isbn) && [10, 13].includes(isbn.toString().length);
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

function printUserInput({ author, date, isbn, notes, review, tags, title }) {
  console.log('===================================');
  console.log('===================================');
  console.log(`Title: ${title}`);
  console.log(`Author: ${author}`);
  console.log(`Date: ${date.toDateString()}`);
  console.log(`ISBN: ${isbn}`)
  if (notes) {
    console.log(`Notes: ${notes}`);
  }
  console.log(`Review: ${review}`)
  console.log(`Tags: ${tags.join(', ')}`)
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

function updateGoodreadsIds(hashCode, goodreadsId) {
  const updatedGoodreadsIds = { ...goodReadsIds, [hashCode]: goodreadsId };
  writeFile('./DATA/GoodReadsIds.js', `module.exports = ${JSON.stringify(updatedGoodreadsIds)};`);
}

const run = async () => {
  const { author, date: rawDate, isbn, notes, review, title } = await getUserInput();
  const { tags } = await getUserTags();

  const { cleanTags, newTags } = await processTags(tags);
  if (newTags) {
    const updatedAllTags = { ...c };

    newTags.forEach((newTag) => {
      updatedAllTags[newTag.tag] = newTag.tag;
    });

    writeFile('./constants.js', `module.exports = ${JSON.stringify(updatedAllTags)};`);

    const newFictionTags =
      newTags
        .filter(newTag => newTag.isFiction)
        .map(newTag => newTag.tag);

    if (newFictionTags.length) {
      writeFile(
        './fictionTags.js',
        `module.exports = ${JSON.stringify([...fictionTags, ...newFictionTags])};`,
      );
    }
  }

  const readDate = processDate(rawDate);
  if (!readDate) {
    return;
  }

  if (!isValidIsbn(isbn)) {
    console.log('Invalid ISBN');
    return;
  }

  printUserInput({ author, date: readDate, isbn, notes, review, tags: cleanTags, title });

  const { confirm: inputConfirmed } = await confirmInput();

  if (!inputConfirmed) {
    return;
  }

  const hashCode = getHashCode(title);
  const googleCacheFilename = getGoogleCachePath(hashCode);

  let googleData;
  let goodReadsId;
  const apiPromises = [];

  if (!fs.existsSync(googleCacheFilename)) {
    const goolgePromise = fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    .then((res) => {
      console.log(`Received Google Books response`);
      return res.json();
    }, (e) => {
      console.log('FAILED to fetch Google Books Data');
      console.log(e);
    })
    .then((res) => {
      const data = res.items && res.items[0];

      if (data) {
        console.log(`writing Google Books Data- ${googleCacheFilename}`);
        writeFile(googleCacheFilename, JSON.stringify(data));
        googleDate = data;
      }
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
      updateGoodreadsIds(hashCode.toString(), goodReadsId);
    }, (e) => {
      console.log(`REJECTED - ${title}`);
      console.log(`REJECTED- ${e}`);

      goodReadsId = null;
      updateGoodreadsIds(hashCode.toString(), goodReadsId);
    });

    apiPromises.push(goodReadsPromise);
  }

  Promise.all(apiPromises).then(() => {
    const book = {
      author,
      date: readDate,
      notes: notes.length ? notes : null,
      review: ReviewMap[review],
      tags: cleanTags,
      title,
      hashCode,
      goodReadsId,
    };

    function writeNewBook(googleData) {
      // Add the new book to the array booksReadRecord, and write the new array to the origin file of booksReadRecord
      writeFile(
        'output.js',
        `module.exports = ${JSON.stringify([...booksReadRecord, { ...book, googleData: formatGoogleData(googleData) }])};`,
      );
    }

    if (googleData) {
      writeNewBook(googleData);
    } else {
      // If no book is found through an ISBN search try searching by title
      const q = querystring.escape(title);
      const backupGooglePromise = fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}`)
        .then((res) => {
          console.log('Searched Google Books by title');
          return res.json();
        })
        .then((res) => {
            // return the first item that has an ISBN and the author is a good match
            const foundItem = res.items && res.items.find((itm) => {
              const { volumeInfo } = itm;
              const { authors, industryIdentifiers } = volumeInfo;
              // We've already searched by title so check if the author is a good match
              const authorMatch = !!authors.join(',').toLowerCase().match(author.split(',')[0].toLowerCase());
              const hasIsbn = industryIdentifiers.find((ident) => ['ISBN_10', 'ISBN_13'].includes(ident.type));

              return authorMatch && hasIsbn;
            });

            if (foundItem) {
              console.log('Found Google Books result by title search')
              writeFile(googleCacheFilename, JSON.stringify(foundItem));
            }

            writeNewBook(foundItem);            
          }
        );
    }
  })
};

run();
