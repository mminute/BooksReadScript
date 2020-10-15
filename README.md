# README

To install/run:
`npm init` and `npm install` if you just pulled this repo down
In the top level directory add `secrets.js` and copy the Good Reads api key and secret there.
`module.exports={ key: ..., secrets: ... }`

Use `node script.js` to generate a new output file based on the data that has been collected in `output.js`

Use `node addBook.js` to add a new entry and update `OUTPUT/booksRead.js`
- ran `npm install inquirer` to get this working
  
Use `node addToRead.js` to add to `OUTPUT/booksToRead.js`