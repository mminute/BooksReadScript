const fs = require("fs");
const writeFile = require('./utils/writeFile');
const writeToWebsite = require('./utils/writeToWebsite');

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

const contents = `module.exports = ${JSON.stringify(booksToRead)};`;

writeFile('./OUTPUT/booksToRead.js' ,contents);
writeToWebsite(contents);
