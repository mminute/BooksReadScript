const booksToRead = require('../OUTPUT/booksToRead');
const writeFile = require('../utils/writeFile');
const writeToWebsite = require('../utils/writeToWebsite');

function removeFromToReadList(toBeRemoved) {
  const updatedList = booksToRead.filter((bk) => {
    return !(bk.title === toBeRemoved.title && bk.author === toBeRemoved.author);
  });

  const content = `module.exports = ${JSON.stringify(updatedList)};`;

  writeFile('./OUTPUT/booksToRead.js', content);
  writeToWebsite('toRead', content);
}

module.exports = removeFromToReadList;
