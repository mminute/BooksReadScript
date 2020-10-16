const writeFile = require('./writeFile');

function writeToWebsite(destination, contents) {
  let filename;
  if (destination === 'read') {
    filename = 'booksRead';
  }

  if (destination === 'toRead') {
    filename = 'booksToRead';
  }

  if (!filename) {
    throw new Error(`Invalid destination passed to writeToWebsite: ${destination}`)
  }

  writeFile(`../masonjenningsIOv2/src/DATA/${filename}.js`, contents);
}

module.exports = writeToWebsite;
