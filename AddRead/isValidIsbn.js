function isValidIsbn(isbnString) {
  return !isNaN(parseInt(isbnString)) && [10, 13].includes(isbnString.length);
}

module.exports = isValidIsbn;
