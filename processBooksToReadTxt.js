const fs = require("fs");
const writeFile = require('./utils/writeFile');
const writeToWebsite = require('./utils/writeToWebsite');

function lastNameFirst(name) {
  const lastName = name.match(/\w*$/)[0];
  const restOfName = name.replace(lastName, '').trim();

  return `${lastName}, ${restOfName}`;
}

function createObject(line) {
  let [title, author] = line.split(' by ');
  author = author.trim();
  title = title.trim()

  let link = null;
  const linkMatch = author.match(/http:\/\/.*\.com/)
  if (linkMatch) {
    link = linkMatch[0];
    author = author.replace(/\(?http:\/\/.*\.com\/?\)?/, '').trim();
  }

  if (author.toLowerCase().match(' and ')) {
    const authors = author.split(/(\,|and)/);
    const names =
      authors
        .filter(str => str !== 'and')
        .map((name, idx) => {
          const trimmed = name.trim();
          if (idx === 0) {
            return lastNameFirst(trimmed);
          }

          return trimmed;
        });
    
    let formatted = '';
    names.forEach((name, idx) => {
      if (idx === 0) {
        formatted += name;
        return;
      }

      if (idx === names.length - 1) {
        formatted += ` and ${name}`;
        return;
      }

      formatted += `, ${name}`;
    });

    author = formatted;
  } else if (author.match('(Editor)')) {
    const authorTxt = author.replace('(Editor)', '').trim();
    author = `${lastNameFirst(authorTxt)} (Editor)`;
  } else {
    author = lastNameFirst(author);
  }

  return {
    author,
    title,
    link,
    added: null,
  };
}

const booksToRead = fs
  .readFileSync('./DATA/BooksToReadRaw.txt')
  .toString()
  .split("\n")
  .map(createObject);

// Find duplicate titles
// const titles = booksToRead.map((obj) => {
//   return obj.title.toLowerCase().trim();
// }).reduce((acc, current) => {
//   if (acc[current]) {
//     acc[current] = acc[current] += 1;
//   } else {
//     acc[current] = 1;
//   }

//   return acc;
// }, {});

// Object.keys(titles).forEach((k) => {
//   if (titles[k] > 1) {
//     console.log(k)
//   }
// });

const contents = `module.exports = ${JSON.stringify(booksToRead)};`;

writeFile('./OUTPUT/booksToRead.js', contents);
writeToWebsite(contents);
