const GENRE_COLORS = {
  fantasy:    { bg: "#e8d5f5", spine: "#9b5de5", label: "#5b2d8e" },
  "sci-fi":   { bg: "#d0eaff", spine: "#3a86ff", label: "#1a3d7c" },
  science:    { bg: "#d0eaff", spine: "#3a86ff", label: "#1a3d7c" },
  romance:    { bg: "#ffd6e0", spine: "#ff6b9d", label: "#8b2252" },
  mystery:    { bg: "#d4f1e4", spine: "#2dc653", label: "#0f5c2e" },
  thriller:   { bg: "#ffe5d9", spine: "#e07a5f", label: "#7a2c1e" },
  horror:     { bg: "#f0d6f5", spine: "#7b2d8b", label: "#4a1a57" },
  nonfiction: { bg: "#fff3cd", spine: "#f4a261", label: "#7c4200" },
  memoir:     { bg: "#ffebc8", spine: "#e9c46a", label: "#7d5500" },
  history:    { bg: "#dde5b6", spine: "#6a994e", label: "#2d5016" },
  biography:  { bg: "#dde5b6", spine: "#6a994e", label: "#2d5016" },
  default:    { bg: "#f5e6d3", spine: "#8b6b4e", label: "#3d2b1f" },
};

function getColor(genre) {
  if (!genre) return GENRE_COLORS.default;
  const key = genre.toLowerCase().replace(/[^a-z-]/g, "");
  return GENRE_COLORS[key] || GENRE_COLORS.default;
}

export default function BookCard({ book, onClick }) {
  const color = getColor(book.genre);
  const avgRating = parseFloat(book.avg_rating) || 0;
  const stars = Math.round(avgRating);

  return (
    <div
      className="group cursor-pointer flex flex-col items-center"
      onClick={() => onClick && onClick(book)}
      title={book.title}
    >
      <div
        className="relative w-20 h-28 rounded-sm transition-transform duration-200 group-hover:-translate-y-3 group-hover:shadow-xl"
        style={{ backgroundColor: color.bg, boxShadow: `3px 3px 0 ${color.spine}` }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-sm"
          style={{ backgroundColor: color.spine }}
        />
        <div className="absolute top-2 right-1 left-3 text-center" style={{ color: color.label }}>
          <span className="text-[9px] font-bold uppercase tracking-wider leading-tight block">
            {book.genre || "General"}
          </span>
        </div>
        <div className="absolute bottom-1.5 left-3 right-1 text-center">
          <span className="text-[9px] text-amber-500">
            {"★".repeat(stars)}{"☆".repeat(5 - stars)}
          </span>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-sm transition-all duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded transition-opacity duration-200">
            View
          </span>
        </div>
      </div>

      <div className="mt-2 text-center w-20">
        <p className="text-[11px] font-semibold text-[#3d2b1f] leading-tight line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
          {book.title}
        </p>
        <p className="text-[10px] text-[#8b6b4e] mt-0.5 truncate">{book.author}</p>
      </div>
    </div>
  );
}