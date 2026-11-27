const { adaptGoogleVolume } = require('../services/googleBookAdapter');

describe('adaptGoogleVolume (Google Books -> internal book)', () => {
  test('maps a full Google volume to our book shape', () => {
    const item = {
      id: 'abc123',
      volumeInfo: {
        title: 'Dune',
        authors: ['Frank Herbert', 'Brian Herbert'],
        categories: ['Fiction', 'Sci-Fi'],
        description: 'Desert planet.',
        publishedDate: '1965-08-01',
        imageLinks: { thumbnail: 'http://img/dune.jpg' },
        industryIdentifiers: [
          { type: 'ISBN_10', identifier: '0441172717' },
          { type: 'ISBN_13', identifier: '9780441172719' },
        ],
      },
    };

    expect(adaptGoogleVolume(item)).toEqual({
      google_id: 'abc123',
      title: 'Dune',
      author: 'Frank Herbert, Brian Herbert',
      genre: 'Fiction',
      description: 'Desert planet.',
      published_year: 1965,
      cover: 'http://img/dune.jpg',
      isbn: '9780441172719',
    });
  });

  test('uses safe defaults when Google leaves fields out', () => {
    const result = adaptGoogleVolume({ id: 'x1', volumeInfo: {} });

    expect(result.title).toBe('Unknown Title');
    expect(result.author).toBe('');
    expect(result.genre).toBe('');
    expect(result.published_year).toBeNull();
    expect(result.cover).toBeNull();
    expect(result.isbn).toBeNull();
  });

  test('does not crash when volumeInfo is missing entirely', () => {
    const result = adaptGoogleVolume({ id: 'x2' });
  
    expect(result).toEqual({
      google_id: 'x2',
      title: 'Unknown Title',
      author: '',
      genre: '',
      description: '',
      published_year: null,
      cover: null,
      isbn: null,
    });
  });
});