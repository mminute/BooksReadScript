const c = require('./constants.js');
const categorizedTitles = require('./DATA/CategorizedTitles');
const fictionTags = require('./fictionTags');

function shouldBeFiction(tags) {
  let isFiction = false;

  return !!fictionTags.map(fictionTag => tags.includes(fictionTag)).filter(Boolean).length;
}

function getTags(title, defaultTags) {
  const titleTags =
    Object
      .keys(categorizedTitles)
      .map((k) => {
        const isTag = categorizedTitles[k].includes(title);

        return isTag ? k : null;
      })
      .filter(Boolean);
  
  const tags = [...defaultTags, ...titleTags];

  if (shouldBeFiction(tags)) {
    tags.push(c.fiction);    
  }

  return Array.from(new Set(tags));
}

function parseLine({ defaultTags, str }) {
  const matches = str.match(/^([\w\s:'\-\(\),?\/&#]*)\.(.*)\.([\w|\d|,\s]*)$/);

  const title = matches[1].trim();
  const author = matches[2].trim();
  const date = matches[3].trim();

  const tags = getTags(title, defaultTags);

  // Reviews will be null, -1 (did not like), 0 (neutral), or 1 (liked)
  return { title, author, date: new Date(date), tags, review: null, notes: null };
}

function parseRegularBooks(str) {
  return parseLine({ str, defaultTags: [] })
}

function parseGraphicNovels(str) {
  return parseLine({ str, defaultTags: [c.graphicNovel] })
}

module.exports = { parseRegularBooks, parseGraphicNovels };
