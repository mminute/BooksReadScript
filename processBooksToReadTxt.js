const fs = require("fs");
const writeFile = require('./utils/writeFile');

function createObject(line) {
  const [title, author] = line.split(' by ');

  // TODO: parse author for Last, First ...

  // Matching this output to the data in addToRead.js
  return {
    author: author.trim(),
    title: title.trim(),
    link: null,
    added: null,
  };
}

const booksToRead = fs
  .readFileSync('./DATA/BooksToReadRaw.txt')
  .toString()
  .split("\n")
  .map(createObject);

writeFile(
  './OUTPUT/booksToRead.js',
  `module.exports = ${JSON.stringify(booksToRead)};`,
);
