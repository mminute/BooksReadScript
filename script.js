/*
  To run: node script.js

  TODO: cli to add a new book?
*/

const constants = require('./constants.js');
const fetch = require('node-fetch');
const fs = require('fs');
const getGoogleCachePath = require('./utils/getGoogleCachePath');
const getHashCode = require('./utils/getHashCode.js');
const goodreadsHttpsRequest = require('./utils/goodreadsHttpsRequest');
const goodReadsIds = require('./DATA/GoodReadsIds');
const https = require('https');
const manuallyProcessed = require('./DATA/manuallyProcessed.js');
const parsers = require('./parsers.js');
const querystring = require('querystring');
const secrets = require('./secrets');
const writeFile = require('./utils/writeFile');

// ================================================================
// Utils
// ================================================================
function sortByDate(book1, book2) {
  return book1.date - book2.date;
}

function consolidateBook(book, googleData) {
  return ({
    author: book.author,
    date: book.date,
    googleData,
    notes: book.notes,
    review: book.review,
    tags: book.tags,
    title: book.title,
    hashCode: book.hashCode,
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitThenDo(cb, idx) {
  await sleep(1200 * idx);
  return cb();
}
// ================================================================
// ================================================================

const rawBooks = fs.readFileSync('./DATA/Books.txt').toString();
const regularBooks = rawBooks.split('\n').map(parsers.parseRegularBooks);
const rawGraphicNovels = fs.readFileSync('./DATA/GraphicNovels.txt').toString();
const graphicNovels = rawGraphicNovels.split('\n').map(parsers.parseGraphicNovels);
const allBooks = [...manuallyProcessed, ...regularBooks, ...graphicNovels].sort(sortByDate);

// FETCH THE BOOK DATA FROM THE GOOGLE BOOKS API OR LOAD THE CACHED DATA
const booksWithFetch = allBooks.map((book)=> {
  const hashCode = getHashCode(book.title);
  const googleCacheFilename = getGoogleCachePath(hashCode);

  let cachedData;
  let fetcher;
  if (!fs.existsSync(googleCacheFilename)) {
    fetcher = () => {
      const q = querystring.escape(book.title);
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}`)
        .then((res) => {
          console.log(`FETCHED- ${book.title}`);
          return res.json();
        })
        .then((res) => {
            // return the first item that has an ISBN
            const foundItem = res.items.find(
              (itm) => itm.volumeInfo.industryIdentifiers.find(
                (ident) => ['ISBN_10', 'ISBN_13'].includes(ident.type)
              )
            )

            writeFile(googleCacheFilename, JSON.stringify(foundItem));

            return foundItem;
          }
        )
    }
  } else {
    cachedData = JSON.parse(fs.readFileSync(googleCacheFilename).toString());
  }

  return {
    ...book,
    hashCode,
    cachedData,
    googleFetchPromise: fetcher && fetcher(),
  };
});

const googleFetchPromises = booksWithFetch.map((bk) => bk.googleFetchPromise).filter(Boolean);

// ONCE ALL THE `fetchPromises` HAVE RESOLVED GO THROUGH AND COLLECT THE DATA
Promise.all(googleFetchPromises).then((results) => {
  const bookPromises = [];
  const booksWithGoogleData = [];

  booksWithFetch.forEach((book) => {
    if (book.googleFetchPromise) {
      const bookPromise = book.googleFetchPromise.then((data) => {
        const { volumeInfo } = data;
  
        const identifiers = volumeInfo.industryIdentifiers;
        const isbn10 = (identifiers.find((ident) => ident.type === 'ISBN_10') || {}).identifier;
        const isbn13 = (identifiers.find((ident) => ident.type === 'ISBN_13') || {}).identifier;
  
        const imageLinks = volumeInfo.imageLinks || {};
  
        const googleData = {
          author: volumeInfo.authors[0],
          categories: volumeInfo.categories,
          description: volumeInfo.description,
          image: imageLinks.thumbnail || imageLinks.smallThumbnail,
          isbn: {
            isbn10,
            isbn13,
          },
          link: volumeInfo.canonicalVolumeLink,
          title: volumeInfo.title,
        };

        booksWithGoogleData.push(consolidateBook(book, googleData));
      })
  
      bookPromises.push(bookPromise);
    } else {
      booksWithGoogleData.push(consolidateBook(book, book.cachedData));
    }
  });

  // ONCE THE LAST SET OF PROMISES RESOLVE WRITE THE OUTPUT
  Promise.all(bookPromises).then(() => {
    const booksWithGoodReadsData = [];
    const goodReadsPromises = [];

    booksWithGoogleData.forEach((bk, idx) => {
      const hashCode = bk.hashCode;
      const isbn = bk.googleData.volumeInfo.industryIdentifiers[0].identifier;

      if (Object.keys(goodReadsIds).includes(hashCode.toString())) {
        booksWithGoodReadsData.push({ ...bk, goodReadsId: goodReadsIds[hashCode] });
      } else {
        goodReadsPromises.push(waitThenDo(() => {
          goodreadsHttpsRequest(isbn, bk.title).then((data) => {
            booksWithGoodReadsData.push({ ...bk, goodReadsId: data });
          }, (e) => {
            console.log(`REJECTED - ${bk.title}`);
            console.log(`REJECTED- ${e}`);

            booksWithGoodReadsData.push({ ...bk, goodReadsId: null });
          })
        }, idx));
      }
    });

    Promise.all(goodReadsPromises).then(() => {
      const newGoodReadsCache = {};
      
      booksWithGoodReadsData.forEach((bk) => {
        newGoodReadsCache[bk.hashCode] = bk.goodReadsId;
      });

      writeFile('./DATA/GoodReadsIds.js', `module.exports = ${JSON.stringify(newGoodReadsCache)};`);
      writeFile('output.js', `module.exports = ${JSON.stringify(booksWithGoodReadsData)};`);
    });
  })
})
