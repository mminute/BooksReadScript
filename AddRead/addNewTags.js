const c = require('../constants');
const fictionTags = require('../fictionTags');
const writeFile = require('../utils/writeFile');

function addNewTags(newTags) {
  if (newTags) {
    const updatedAllTags = { ...c };

    newTags.forEach((newTag) => {
      updatedAllTags[newTag.tag] = newTag.tag;
    });

    writeFile('./constants.js', `module.exports = ${JSON.stringify(updatedAllTags)};`);

    const newFictionTags =
      newTags
        .filter(newTag => newTag.isFiction)
        .map(newTag => newTag.tag);

    if (newFictionTags.length) {
      writeFile(
        './fictionTags.js',
        `module.exports = ${JSON.stringify([...fictionTags, ...newFictionTags])};`,
      );
    }
  }
}

module.exports = addNewTags;
