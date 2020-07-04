/*
  To run: node script.js

  Script seems to hang when running the full list of books.
  Maybe getting rate limited by google
  TODO: Throw in some logs, maybe setTimeouts?
*/

const constants = require('./constants.js');
const fetch = require('node-fetch');
const fs = require('fs');
const getHashCode = require('./getHashCode.js');
const manuallyProcessed = require('./DATA/manuallyProcessed.js');
const parsers = require('./parsers.js');
const querystring = require('querystring');

// ================================================================
// Utils
// ================================================================
function sortByDate(book1, book2) {
  return book1.date - book2.date;
}

function writeFile(filename, contents) {
  fs.writeFile(filename, contents, function cb (err) {
    if (err) {
      throw err;
    }

    console.log(`File created! ${filename}`);
  })
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
  });
}
// ================================================================
// ================================================================

const rawBooks = fs.readFileSync('./DATA/Books.txt').toString();
const regularBooks = rawBooks.split('\n').map(parsers.parseRegularBooks);

const rawGraphicNovels = fs.readFileSync('./DATA/GraphicNovels.txt').toString();
const graphicNovels = rawGraphicNovels.split('\n').map(parsers.parseGraphicNovels);

const allBooks = [...manuallyProcessed, ...regularBooks, ...graphicNovels].sort(sortByDate);

const booksWithFetch = allBooks.map((book)=> {
  const q = querystring.escape(book.title);
  const cacheFilename = `./DATA/GoogleData/${getHashCode(book.title)}.json`;

  let cachedData;
  let fetcher;
  if (!fs.existsSync(cacheFilename)) {
    fetcher = () => {
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

            writeFile(cacheFilename, JSON.stringify(foundItem));

            return foundItem;
          }
        )
    }
  } else {
    cachedData = JSON.parse(fs.readFileSync(cacheFilename).toString());
  }

  return {
    ...book,
    cachedData,
    fetchPromise: fetcher && fetcher(),
  };
});

const fetchPromises = booksWithFetch.map((bk) => bk.fetchPromise).filter(Boolean);

Promise.all(fetchPromises).then((results) => {
  const bookPromises = [];
  const booksWithGoogleData = [];

  booksWithFetch.forEach((book) => {
    if (book.fetchPromise) {
      const bookPromise = book.fetchPromise.then((data) => {
        const { volumeInfo } = data;
  
        const identifiers = volumeInfo.industryIdentifiers;
        const isbn10 = (identifiers.find((ident) => ident.type === 'ISBN_10') || {}).identifier;
        const isbn13 = (identifiers.find((ident) => ident.type === 'ISBN_13') || {}).identifier;
  
        const imageLinks = volumeInfo.imageLinks || {};
  
        const googleData = {
          author: volumeInfo.authors[0], // (volumeInfo.authors && volumeInfo.authors[0]) || ''
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

  Promise.all(bookPromises).then(() => {
    writeFile('output.js', `module.exports = ${JSON.stringify(booksWithGoogleData)};`);
  })
})
