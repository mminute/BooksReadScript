#!/usr/bin/env node

/*
  To run: node addBook.js

  https://codeburst.io/building-a-node-js-interactive-cli-3cb80ed76c86
  https://medium.com/skilllane/build-an-interactive-cli-application-with-node-js-commander-inquirer-and-mongoose-76dc76c726b6
  https://www.npmjs.com/package/inquirer
*/
const fetch = require("node-fetch");
const fs = require("fs");
const querystring = require("querystring");
const addNewTags = require("./AddRead/addNewTags");
const booksReadRecord = require("./OUTPUT/booksRead");
const confirmInput = require("./AddRead/confirmInput");
const crossCheckBooksToRead = require("./AddRead/crossCheckBooksToRead");
const formatGoogleData = require("./utils/formatGoogleData");
const getGoogleCachePath = require("./utils/getGoogleCachePath");
const getHashCode = require("./utils/getHashCode.js");
const getUserInput = require("./AddRead/getUserInput");
const getUserTags = require("./AddRead/getUserTags");
const goodreadsHttpsRequest = require("./utils/goodreadsHttpsRequest");
const goodReadsIds = require("./DATA/GoodReadsIds");
const isValidIsbn = require("./AddRead/isValidIsbn");
const printUserInput = require("./AddRead/printUserInput");
const proceedWithouISBN = require("./AddRead/proceedWithouISBN");
const processTags = require("./AddRead/processTags");
const removeFromToReadList = require("./AddRead/removeFromToReadList");
const selectBookFromList = require("./AddRead/selectBookFromList");
const writeFile = require("./utils/writeFile");
const writeToWebsite = require("./utils/writeToWebsite");

const ReviewMap = {
  Neutral: 0,
  Liked: 1,
  Disliked: -1,
};

function buildBook({
  author,
  date,
  notes,
  review,
  tags,
  title,
  hashCode,
  goodReadsId,
}) {
  return {
    author,
    date,
    notes: notes.length ? notes : null,
    review: ReviewMap[review],
    tags,
    title,
    hashCode,
    goodReadsId,
  };
}

function processDate(rawDate) {
  if (isNaN(rawDate)) {
    return null;
  }

  const matches = rawDate.toString().match(/(\d{4})(\d{2})(\d{2})/);

  if (!matches) {
    console.log("no matches");
    return null;
  }

  const [_, _year, _month, _day] = matches;
  const yearInt = parseInt(_year);
  const monthInt = parseInt(_month);
  const dayInt = parseInt(_day);

  if (yearInt < 2020 || yearInt > 2100) {
    console.log("Invalid year");
    return null;
  }

  if (monthInt < 1 || monthInt > 12) {
    console.log("Invalid month");
    return null;
  }

  if (dayInt < 1 || dayInt > 31) {
    console.log("Invalid day");
    return null;
  }

  const readDate = Date.parse(`${_year}-${_month}-${_day}T00:00:00`);

  if (isNaN(readDate)) {
    console.log("Invalid date object");
    return null;
  }

  return new Date(readDate);
}

function updateGoodreadsIds(hashCode, goodreadsId) {
  const updatedGoodreadsIds = { ...goodReadsIds, [hashCode]: goodreadsId };
  writeFile(
    "./DATA/GoodReadsIds.js",
    `module.exports = ${JSON.stringify(updatedGoodreadsIds)};`
  );
}

const run = async () => {
  const {
    author,
    date: rawDate,
    isbn,
    notes,
    review,
    title,
  } = await getUserInput();
  const { tags } = await getUserTags();

  const { cleanTags, newTags } = await processTags(tags);

  addNewTags(newTags);

  const readDate = processDate(rawDate);
  if (!readDate) {
    return;
  }

  if (!isValidIsbn(isbn)) {
    if (isNaN(parseInt(isbn))) {
      console.log("The ISBN you entered is not a number");
      const { ignoreIsbn } = await proceedWithouISBN();

      if (ignoreIsbn) {
        printUserInput({
          author,
          date: readDate,
          isbn,
          notes,
          review,
          tags: cleanTags,
          title,
        });
      
        const { confirm: confirmInputNoIsbn } = await confirmInput();
      
        if (!confirmInputNoIsbn) {
          return;
        }

        const bookWithoutIsbn = buildBook({
          author,
          date: readDate,
          notes,
          review,
          tags: cleanTags,
          title,
          hashCode: null,
          goodReadsId: null,
        });

        const contents = `module.exports = ${JSON.stringify([
          ...booksReadRecord,
          { ...bookWithoutIsbn, googleData: null },
        ])};`;

        writeFile("./OUTPUT/booksRead.js", contents);
        // writeToWebsite('read', contents);
      }
    } else {
      console.log("Invalid ISBN");
    }

    return;
  }

  printUserInput({
    author,
    date: readDate,
    isbn,
    notes,
    review,
    tags: cleanTags,
    title,
  });

  const { confirm: inputConfirmed } = await confirmInput();

  if (!inputConfirmed) {
    return;
  }

  const hashCode = getHashCode(title);
  const googleCacheFilename = getGoogleCachePath(hashCode);

  let googleData;
  let goodReadsId;
  const apiPromises = [];

  if (fs.existsSync(googleCacheFilename)) {
    googleData = JSON.parse(fs.readFileSync(googleCacheFilename).toString());
  } else {
    const goolgePromise = fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    )
      .then(
        (res) => {
          console.log(`Received Google Books response`);
          return res.json();
        },
        (e) => {
          console.log("FAILED to fetch Google Books Data");
          console.log(e);
        }
      )
      .then((res) => {
        const data = res.items && res.items[0];

        if (data) {
          console.log(`writing Google Books Data- ${googleCacheFilename}`);
          writeFile(googleCacheFilename, JSON.stringify(data));
          googleData = data; // TODO this was googleDate instead of googleData, should be data?
        }
      });

    apiPromises.push(goolgePromise);
  }

  if (Object.keys(goodReadsIds).includes(hashCode.toString())) {
    goodReadsId = goodReadsIds[hashCode];
  } else {
    const goodReadsPromise = goodreadsHttpsRequest(isbn, title).then(
      (data) => {
        goodReadsId = data;
        updateGoodreadsIds(hashCode.toString(), goodReadsId);
      },
      (e) => {
        console.log(`REJECTED - ${title}`);
        console.log(`REJECTED- ${e}`);

        goodReadsId = null;
        updateGoodreadsIds(hashCode.toString(), goodReadsId);
      }
    );

    apiPromises.push(goodReadsPromise);
  }

  Promise.all(apiPromises).then(async () => {
    const book = buildBook({
      author,
      date: readDate,
      notes,
      review,
      tags: cleanTags,
      title,
      hashCode,
      goodReadsId,
    });

    async function writeNewBook(googleData) {
      // Add the new book to the array booksReadRecord, and write the new array to the origin file of booksReadRecord
      // Update the file in my website repo with the new data too
      const contents = `module.exports = ${JSON.stringify([
        ...booksReadRecord,
        { ...book, googleData: formatGoogleData(googleData) },
      ])};`;
      writeFile("./OUTPUT/booksRead.js", contents);
      writeToWebsite("read", contents);
      const matchedToReads = crossCheckBooksToRead(book);

      matchedToReads.forEach((matchedBk) => {
        console.log("===========================");
        console.log("Option 1:");
        console.log("===========================");
        console.log(matchedBk.title);
        console.log(matchedBk.author);
        console.log(`Match score: ${matchedBk.matchScore}`);
        console.log("===========================");
      });

      if (matchedToReads.length) {
        const { toRemove } = await selectBookFromList(
          matchedToReads.map((_, idx) => `${idx + 1}`)
        );

        const selectedOption = parseInt(toRemove, 10);

        if (selectedOption) {
          removeFromToReadList(matchedToReads[selectedOption - 1]);
        }
      }
    }

    if (googleData) {
      await writeNewBook(googleData);
    } else {
      // If no book is found through an ISBN search try searching by title
      const q = querystring.escape(title);
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}`)
        .then((res) => {
          console.log("Searched Google Books by title");
          return res.json();
        })
        .then((res) => {
          // return the first item that has an ISBN and the author is a good match
          const foundItem =
            res.items &&
            res.items.find((itm) => {
              const { volumeInfo } = itm;
              const { authors, industryIdentifiers } = volumeInfo;
              // We've already searched by title so check if the author is a good match
              const authorMatch = !!authors
                .join(",")
                .toLowerCase()
                .match(author.split(",")[0].toLowerCase());
              const hasIsbn = industryIdentifiers.find((ident) =>
                ["ISBN_10", "ISBN_13"].includes(ident.type)
              );

              return authorMatch && hasIsbn;
            });

          if (foundItem) {
            console.log("Found Google Books result by title search");
            writeFile(googleCacheFilename, JSON.stringify(foundItem));
          }

          writeNewBook(foundItem);
        });
    }
  });
};

run();
