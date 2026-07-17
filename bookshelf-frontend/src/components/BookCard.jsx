import React from "react";
import { getGenreColor } from '../utils/genreColors';

export default function BookCard({ book, onClick }) {
  // Pass the genre to your utility function. Ensure your utility splits commas if needed!
  const color = getGenreColor(book.genre);
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
          backgroundColor: color?.bg || "#F5E5C9",
          boxShadow: `3px 3px 0 ${color?.spine || "#4A3423"}`,
          border: `2px solid ${color?.spine || "#4A3423"}`,
        }}
      >
        {/* Colored spine strip — always shows genre color */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2.5 z-10 flex-shrink-0"
          style={{ backgroundColor: color?.spine || "#4A3423" }}
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
              style={{ color: color?.spine || "#4A3423" }}
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
