function formatGoogleData() {
  const { volumeInfo } = data;

  const identifiers = volumeInfo.industryIdentifiers;
  const isbn10 = (identifiers.find((ident) => ident.type === 'ISBN_10') || {}).identifier;
  const isbn13 = (identifiers.find((ident) => ident.type === 'ISBN_13') || {}).identifier;

  return {
    author: volumeInfo.authors[0],
    categories: volumeInfo.categories,
    description: volumeInfo.description,
    image: imageLinks.thumbnail || imageLinks.smallThumbnail,
    isbn: {
      isbn10,
      isbn13,
    },
    link: volumeInfo.canonicalVolumeLink,
    title: volumeInfo.title,
  };
}

module.exports = formatGoogleData;
