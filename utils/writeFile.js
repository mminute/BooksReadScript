const fs = require('fs');

function writeFile(filename, contents) {
  fs.writeFile(filename, contents, function cb (err) {
    if (err) {
      throw err;
    }
  })
}

module.exports = writeFile;
