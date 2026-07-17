const GENRE_COLORS = {
  fantasy:           { bg: '#e8d5f5', spine: '#9b5de5' },
  'sci-fi':          { bg: '#d0eaff', spine: '#3a86ff' },
  'science fiction': { bg: '#d0eaff', spine: '#3a86ff' },
  romance:           { bg: '#ffd6e0', spine: '#ff6b9d' },
  mystery:           { bg: '#d4f1e4', spine: '#2dc653' },
  thriller:          { bg: '#ffe5d9', spine: '#e07a5f' },
  horror:            { bg: '#f0d6f5', spine: '#7b2d8b' },
  nonfiction:        { bg: '#fff3cd', spine: '#f4a261' },
  'non-fiction':     { bg: '#fff3cd', spine: '#f4a261' },
  'self-help':       { bg: '#fff3cd', spine: '#f4a261' },
  memoir:            { bg: '#ffebc8', spine: '#e9c46a' },
  history:           { bg: '#dde5b6', spine: '#6a994e' },
  biography:         { bg: '#dde5b6', spine: '#6a994e' },
  fiction:           { bg: '#f5e6d3', spine: '#8b6b4e' },
  'literary fiction':{ bg: '#f5e6d3', spine: '#c97d4e' },
  'historical fiction':{ bg: '#dde5b6', spine: '#8b7355' },
  default:           { bg: '#f5e6d3', spine: '#8b6b4e' },
};

function getColor(genre) {
  if (!genre) return GENRE_COLORS.default;
  // genre might be "Children's stories, English" — take first part
  const first = genre.split(',')[0].trim().toLowerCase();
  return GENRE_COLORS[first] || GENRE_COLORS.default;
}

export default function BookCard({ book, onClick }) {
  const color = getColor(book.genre);
  const stars = Math.round(parseFloat(book.avg_rating) || 0);
  const hasCover = !!book.cover_url;

  return (
    <div
      className="group cursor-pointer flex flex-col items-center"
      onClick={() => onClick && onClick(book)}
      title={book.title}
    >
      {/* Book body */}
      <div
        className="relative w-20 h-28 rounded-sm transition-transform duration-200 group-hover:-translate-y-3 group-hover:shadow-xl overflow-hidden"
        style={{
          backgroundColor: color.bg,
          boxShadow: `3px 3px 0 ${color.spine}`,
          border: `2px solid ${color.spine}`,
        }}
      >
        {/* Colored spine strip — always shows genre color */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2.5 z-10 flex-shrink-0"
          style={{ backgroundColor: color.spine }}
        />

        {/* Cover image if available */}
        {hasCover ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ left: '10px', width: 'calc(100% - 10px)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          /* No cover — show genre label + stars */
          <>
            <div
              className="absolute top-2 left-4 right-1"
              style={{ color: color.spine }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider leading-tight block">
                {book.genre?.split(',')[0] || 'General'}
              </span>
            </div>
            <div className="absolute bottom-1.5 left-3 right-1 text-center">
              <span className="text-[9px] text-amber-500">
                {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
              </span>
            </div>
          </>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center z-20">
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white bg-black bg-opacity-60 px-2 py-1 rounded transition-opacity duration-200">
            View
          </span>
        </div>
      </div>

      {/* Title + author below */}
      <div className="mt-2 text-center w-20">
        <p
          className="text-[11px] font-semibold text-[#3d2b1f] leading-tight line-clamp-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {book.title}
        </p>
        <p className="text-[10px] text-[#8b6b4e] mt-0.5 truncate">{book.author}</p>
      </div>
    </div>
  );
}