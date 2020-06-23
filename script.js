/*
  To run: node script.js
*/

const fs = require('fs');
const constants = require('./constants.js');
const manuallyProcessed = require('./manuallyProcessed.js');

function sortByDate(book1, book2) {
  return book1.date - book2.date;
}

function parseLine({ defaultTags, str }) {
  const matches = str.match(/^([\w\s:'\-\(\),?\/&#]*)\.(.*)\.([\w|\d|,\s]*)$/);

  const title = matches[1].trim();
  const author = matches[2].trim();
  const date = matches[3].trim();

  // Reviews will be -1 (did not like), 0 (neutral), or 1 (liked)
  return { title, author, date: new Date(date), tags: defaultTags, review: 0, notes: null };
}

function parseRegularBooks(str) {
  return parseLine({ str, defaultTags: [] })
}

function parseGraphicNovels(str) {
  return parseLine({ str, defaultTags: [constants.graphicNovel] })
}

const rawBooks = fs.readFileSync('./Books.txt').toString();
const regularBooks = rawBooks.split('\n').map(parseRegularBooks);

const rawGraphicNovels = fs.readFileSync('./GraphicNovels.txt').toString();
const graphicNovels = rawGraphicNovels.split('\n').map(parseGraphicNovels);

const allBooks = [...manuallyProcessed, ...regularBooks, ...graphicNovels].sort(sortByDate);

console.log(allBooks);

fs.writeFile('output.js', `module.exports = ${JSON.stringify(regularBooks)};`, function cb (err) {
  if (err) {
    throw err;
  }

  console.log('File created!')
})
