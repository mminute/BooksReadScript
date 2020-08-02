const https = require('https');
const secrets = require('../secrets');

function goodreadsHttpsRequest(isbn, title) {
  console.log(`Fetching Goodreads for ${title}`);
  return new Promise((resolve, reject) => {
    const req = https.get(`https://www.goodreads.com/book/isbn_to_id/${isbn}?key=${secrets.key}`, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode));
      }

      let data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });

      res.on('end', function() {
        resolve(data);
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });
  });
}

module.exports = goodreadsHttpsRequest;
