// FACTORY PATTERN (creational, "simple factory")
// A book can be created from different sources (manual form, Google import),
// each with slightly different rules. Instead of repeating those rules in every
// route, callers ask the factory: createBookData('manual' | 'google', data, userId)
// and always get back an object that matches the books table.

class BookValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'BookValidationError';
    }
  }
  
  const toYear = (value) => (value ? Number(value) : null);
  
  const isValidYear = (year) =>
    Number.isInteger(year) && year >= 1000 && year <= new Date().getFullYear();
  
  // Fields shared by every source (also validates title and author)
  const commonFields = (data) => {
    const title = String(data.title || '').trim();
    const author = String(data.author || '').trim();
  
    if (!title || !author) {
      throw new BookValidationError('Title and author are required');
    }
    if (title.length > 500) {
      throw new BookValidationError('Title must be between 1 and 500 characters');
    }
  
    return {
      title,
      author,
      genre: data.genre || null,
      description: data.description || null,
    };
  };
  
  // One creator per source
  const creators = {
    // User typed it in: strict rules, owned by that user
    manual: (data, userId) => {
      const year = toYear(data.published_year);
      if (year !== null && !isValidYear(year)) {
        throw new BookValidationError('Invalid published year');
      }
      return {
        ...commonFields(data),
        published_year: year,
        cover_url: data.cover_url || null,
        added_by: userId,
      };
    },
  
    // Imported from Google (already adapted): forgiving year, no owner
    google: (data) => {
      const year = toYear(data.published_year);
      return {
        ...commonFields(data),
        published_year: isValidYear(year) ? year : null,
        cover_url: data.cover || null,
        added_by: null,
      };
    },
  };
  
  const createBookData = (source, data, userId = null) => {
    const creator = creators[source];
    if (!creator) {
      throw new Error(`Unknown book source: ${source}`);
    }
    return creator(data, userId);
  };
  
  module.exports = { createBookData, BookValidationError };