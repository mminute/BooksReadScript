const constants = require('./constants.js');

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

module.exports = { parseRegularBooks, parseGraphicNovels };
