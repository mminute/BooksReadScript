function isValidIsbn(isbn) {
  return !isNaN(isbn) && [10, 13].includes(isbn.toString().length);
}

module.exports = isValidIsbn;
