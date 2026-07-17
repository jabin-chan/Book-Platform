// Single source of truth for genre → color mapping.
// Import this everywhere a book's genre needs a color (BookCard, Explore
// BookTile, MyShelf tiles, ExplorePanel) so every page agrees.

export const GENRE_COLORS = {
    fantasy:              { bg: '#e8d5f5', spine: '#9b5de5' },
    'sci-fi':              { bg: '#d0eaff', spine: '#3a86ff' },
    'science fiction':     { bg: '#d0eaff', spine: '#3a86ff' },
    romance:               { bg: '#ffd6e0', spine: '#ff6b9d' },
    mystery:               { bg: '#d4f1e4', spine: '#2dc653' },
    thriller:              { bg: '#ffe5d9', spine: '#e07a5f' },
    horror:                { bg: '#f0d6f5', spine: '#7b2d8b' },
    nonfiction:            { bg: '#fff3cd', spine: '#f4a261' },
    'non-fiction':          { bg: '#fff3cd', spine: '#f4a261' },
    'self-help':            { bg: '#fff3cd', spine: '#f4a261' },
    memoir:                { bg: '#ffebc8', spine: '#e9c46a' },
    history:                { bg: '#dde5b6', spine: '#6a994e' },
    biography:              { bg: '#dde5b6', spine: '#6a994e' },
    fiction:                { bg: '#f5e6d3', spine: '#8b6b4e' },
    'literary fiction':     { bg: '#f5e6d3', spine: '#c97d4e' },
    'historical fiction':   { bg: '#dde5b6', spine: '#8b7355' },
    default:                { bg: '#f5e6d3', spine: '#8b6b4e' },
  };
  
  export function getGenreColor(genre) {
    if (!genre) return GENRE_COLORS.default;
    const first = genre.split(',')[0].trim().toLowerCase();
    return GENRE_COLORS[first] || GENRE_COLORS.default;
  }