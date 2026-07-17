// Single source of truth for genre → color mapping.
// Optimized for the Ghibli-Style Cozy Library Nook aesthetic.

export const GENRE_COLORS = {
    // Cozy, desaturated pastel tones that match the hand-drawn anime aesthetic
    fantasy:              { bg: '#EADCF7', spine: '#9076A1' }, // Muted lavender
    'sci-fi':             { bg: '#DCE8F7', spine: '#6886A8' }, // Dusty denim blue
    'science fiction':    { bg: '#DCE8F7', spine: '#6886A8' },
    romance:              { bg: '#FADCE2', spine: '#C47885' }, // Soft rose petal
    mystery:              { bg: '#DCEFE3', spine: '#6E947C' }, // Antique sage green
    thriller:             { bg: '#F7E7DC', spine: '#A67358' }, // Warm terracotta
    horror:               { bg: '#E2D6E5', spine: '#785A7F' }, // Smoky plum
    nonfiction:           { bg: '#F7EECE', spine: '#B08E56' }, // Dull gold
    'non-fiction':         { bg: '#F7EECE', spine: '#B08E56' },
    'self-help':          { bg: '#F7EECE', spine: '#B08E56' },
    memoir:               { bg: '#F7EACE', spine: '#B5945B' },
    history:              { bg: '#E4EAD2', spine: '#77885C' }, // Mossy olive green
    biography:            { bg: '#E4EAD2', spine: '#77885C' },
    fiction:              { bg: '#F4E9DC', spine: '#8B6B4E' }, // Classic parchment wood
    'literary fiction':   { bg: '#F4E9DC', spine: '#A17050' },
    'historical fiction': { bg: '#E4EAD2', spine: '#826E59' },
    default:              { bg: '#F4E9DC', spine: '#8B6B4E' }, // Master Espresso/Wood fallback
  };
  
  export function getGenreColor(genreInput) {
    if (!genreInput) return GENRE_COLORS.default;
  
    // FIX: Handle both arrays from Google Books API and raw strings from custom user forms
    let genreStr = '';
    if (Array.isArray(genreInput)) {
      genreStr = genreInput[0] || '';
    } else if (typeof genreInput === 'string') {
      genreStr = genreInput;
    }
  
    if (!genreStr) return GENRE_COLORS.default;
  
    // Split by comma (e.g. "Children's stories, English") or by slash (e.g. "Fiction / General")
    const cleanGenre = genreStr.split(/[,/]/)[0].trim().toLowerCase();
  
    return GENRE_COLORS[cleanGenre] || GENRE_COLORS.default;
  }
  