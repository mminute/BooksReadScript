const inquirer = require("inquirer");
const c = require('../constants.js');

function getUserTags() {
  const itemsToPrintOnALine = 5;
  const allTags = Object.values(c);
  const maxTagLength = Math.max(...allTags.map(t => t.length));

  let tagsOnLine = itemsToPrintOnALine;
  while (tagsOnLine < allTags.length + itemsToPrintOnALine) {
    // Pretty print all of the existing tags
    const stringLine = allTags.slice(tagsOnLine - 5, tagsOnLine).map((t) => {
      const padding = ' '.repeat((maxTagLength - t.length)/2);
      const str = ` ${padding}${t}${padding} `;
      return str.length === maxTagLength + 2 ? str : str + ' '.repeat(maxTagLength + 2 - str.length);
    }).join('|');

    console.log(stringLine);

    tagsOnLine += itemsToPrintOnALine;
  }

  return inquirer.prompt(
    {
      message: 'Enter a tags (comma separated list):',
      name: 'tags',
      type: 'input',
    },
  );
}

module.exports = getUserTags;
