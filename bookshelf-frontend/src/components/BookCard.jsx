//single book card in the grid
const SPINE_COLORS = [
    'bg-amber-50',  'bg-orange-50', 'bg-yellow-50',
    'bg-stone-100', 'bg-rose-50',   'bg-sky-50',
  ];
  
  export default function BookCard({ book, isSelected, onClick }) {
    // pick a colour based on the first letter of the title
    // so the same book always gets the same colour
    const colorIndex = book.title.charCodeAt(0) % SPINE_COLORS.length;
    const spineColor = SPINE_COLORS[colorIndex];
  
    return (
      <div
        onClick={() => onClick(book)}
        className={`
          bg-white border rounded-lg overflow-hidden cursor-pointer
          transition hover:shadow-md
          ${isSelected
            ? 'border-coffee-600 ring-1 ring-coffee-600'
            : 'border-coffee-200 hover:border-coffee-400'}
        `}
      >
        {/* coloured spine block */}
        <div className={`${spineColor} h-24 flex items-center justify-center text-3xl`}>
          📚
        </div>
  
        <div className="p-2.5">
          <p className="font-serif text-coffee-700 text-xs leading-snug line-clamp-2 min-h-8">
            {book.title}
          </p>
          <p className="font-sans text-coffee-400 text-xs mt-1 truncate">
            {book.author}
          </p>
          {book.avg_rating && (
            <p className="text-amber-400 text-xs mt-1">
              {'★'.repeat(Math.round(book.avg_rating))}
              <span className="text-coffee-200">
                {'★'.repeat(5 - Math.round(book.avg_rating))}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }