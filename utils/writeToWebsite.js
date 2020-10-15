const fs = require('fs');
const writeFile = require('./writeFile');

function writeToWebsite(contents) {
  writeFile('../masonjenningsIOv2/src/DATA/booksRead.js', contents);
}

module.exports = writeToWebsite;
