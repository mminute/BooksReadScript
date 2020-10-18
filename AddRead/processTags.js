const c = require('../constants.js');
const getValidTag = require('./getValidTag');
const getNewTagsFiction = require('./getNewTagsFiction');
const fictionTags = require('../fictionTags');

const canonicalTags = Object.values(c);

async function fixDirtyTags(dirtyTags) {
  const cleanTags = []
  for (const tag of dirtyTags) {
    const updatedTag = await getValidTag(tag);
    cleanTags.push(updatedTag);
  }

  return cleanTags;
}

async function processTags(tags) {
  const tagsArr = tags.split(',').map((w) => w.replace(' ', ''));
  let cleanTags = [];
  const dirtyTags = [];
  let newTags;

  tagsArr.forEach((tag) => {
    const collection = canonicalTags.includes(tag) ? cleanTags : dirtyTags;
    collection.push(tag);
  })

  if (dirtyTags.length) {
    const cleansedTags = await fixDirtyTags(dirtyTags);
    
    cleanTags = [...cleanTags, ...cleansedTags];

    newTags = await getNewTagsFiction(cleanTags.filter((tag) => !canonicalTags.includes(tag)));
  }

  if (cleanTags.find(tag => fictionTags.includes(tag)) || newTags && newTags.find(tag => tag.isFiction)) {
    cleanTags.push(c.fiction)
  }

  cleanTags = Array.from(new Set(cleanTags)); // Remove any duplicates now that your are done adding tags

  return { cleanTags, newTags };
}

module.exports = processTags;