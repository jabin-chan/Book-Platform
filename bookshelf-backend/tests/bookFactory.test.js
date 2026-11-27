const { createBookData, BookValidationError } = require('../services/bookFactory');

describe('createBookData (book factory)', () => {
  test('manual: trims text, sets added_by to the user, maps cover_url', () => {
    const book = createBookData(
      'manual',
      { title: '  Dune ', author: ' Frank Herbert ', cover_url: 'http://c.jpg', published_year: '1965' },
      7
    );

    expect(book).toEqual({
      title: 'Dune',
      author: 'Frank Herbert',
      genre: null,
      description: null,
      published_year: 1965,
      cover_url: 'http://c.jpg',
      added_by: 7,
    });
  });

  test('google: added_by is null and cover is mapped to cover_url', () => {
    const book = createBookData('google', {
      title: 'Dune',
      author: 'Frank Herbert',
      cover: 'http://g.jpg',
      published_year: 1965,
    });

    expect(book.added_by).toBeNull();
    expect(book.cover_url).toBe('http://g.jpg');
  });

  test('manual: rejects a missing or whitespace-only author', () => {
    expect(() => createBookData('manual', { title: 'Dune' }, 1)).toThrow(
      'Title and author are required'
    );
    expect(() => createBookData('manual', { title: 'Dune', author: '   ' }, 1)).toThrow(
      BookValidationError
    );
  });

  test('manual: rejects a title longer than 500 characters', () => {
    expect(() =>
      createBookData('manual', { title: 'a'.repeat(501), author: 'X' }, 1)
    ).toThrow('Title must be between 1 and 500 characters');
  });

  test('manual: rejects a future published year', () => {
    const future = new Date().getFullYear() + 1;
    expect(() =>
      createBookData('manual', { title: 'T', author: 'A', published_year: future }, 1)
    ).toThrow('Invalid published year');
  });

  test('google: turns an invalid year into null instead of failing', () => {
    const book = createBookData('google', { title: 'T', author: 'A', published_year: 50 });
    expect(book.published_year).toBeNull();
  });

  test('throws on an unknown source', () => {
    expect(() => createBookData('alien', { title: 'T', author: 'A' })).toThrow(
      'Unknown book source'
    );
  });
});