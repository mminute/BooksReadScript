function printUserInput({ author, date, isbn, notes, review, tags, title }) {
  console.log('===================================');
  console.log('===================================');
  console.log(`Title: ${title}`);
  console.log(`Author: ${author}`);
  console.log(`Date: ${date.toDateString()}`);
  console.log(`ISBN: ${isbn}`)
  if (notes) {
    console.log(`Notes: ${notes}`);
  }
  console.log(`Review: ${review}`)
  console.log(`Tags: ${tags.join(', ')}`)
  console.log('===================================');
  console.log('===================================');
}

module.exports = printUserInput;
