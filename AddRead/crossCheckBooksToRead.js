const booksToRead = require('../OUTPUT/booksToRead');

const lastNameMatcher = new RegExp(/(.*),/);

function getLastName(name) {
  return name.match(lastNameMatcher)[1].toLowerCase();
}

function breakDownTitle(title) {
  return title
    .toLowerCase()
    .split(' ')
    .sort((a, b) => {
      if (a.length > b.length) {
        return 1;
      }

      if (b.length > a.length) {
        return -1;
      }

      return 0;
    })
    .reverse()
}


function crossCheckBooksToRead(readBook) {
  const { author: readAuthor, title: readTitle } = readBook;
  const readAuthorLastName = getLastName(readAuthor);
  const readTitleParts = breakDownTitle(readTitle);

  const matchedBooksOnToRead = [];

  booksToRead.forEach((bkToRead) => {
    const toReadAuthorLastName = getLastName(bkToRead.author);

    let score = readAuthorLastName === toReadAuthorLastName ? 100 : 0;

    breakDownTitle(bkToRead.title).forEach((wrd, idx) => {
      if (readTitleParts.includes(wrd)) {
        score += 100 / (idx + 1);
      }
    });

    if (score >= 100) {
      matchedBooksOnToRead.push({ ...bkToRead, matchScore: score });
    }
  })

  return matchedBooksOnToRead.sort((a, b) => {
    if (a.matchScore < b.matchScore) {
      return 1;
    }

    if (a.matchScore > b.matchScore) {
      return -1;
    }
 
    // a must be equal to b
    return 0;
  });
}

module.exports = crossCheckBooksToRead;
