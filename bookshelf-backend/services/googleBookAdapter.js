// ADAPTER PATTERN (structural)
// Google Books returns its own JSON format (volumeInfo.authors[], imageLinks...).
// This adapter converts it into the book shape the rest of our app uses,
// so no other file needs to know what Google's response looks like.

const adaptGoogleVolume = (item) => {
    const info = item.volumeInfo || {};
    const year = parseInt(info.publishedDate?.substring(0, 4), 10);
  
    return {
      google_id: item.id,
      title: info.title || 'Unknown Title',
      author: (info.authors || []).join(', '),
      genre: (info.categories || [''])[0],
      description: info.description || '',
      published_year: Number.isNaN(year) ? null : year,
      cover: info.imageLinks?.thumbnail || null,
      isbn:
        (info.industryIdentifiers || []).find((i) => i.type === 'ISBN_13')
          ?.identifier || null,
    };
  };
  
  module.exports = { adaptGoogleVolume };