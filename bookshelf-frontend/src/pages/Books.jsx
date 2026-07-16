// main bookshelf page

import { useEffect, useState, useRef } from "react";
import api from "../api";
import BookCard from "../components/BookCard";
import BookPanel from "../components/BookPanel";
import AddBookModal from "../components/AddBookModal";
import SearchBar from "../components/SearchBar";

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function Books({ user }) {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(null);

  const [modalBook, setModalBook] = useState(null);
  const [manualTitle, setManualTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const panelRef = useRef(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);

    try {
      const res = await api.get("/books");
      const sorted = [...res.data].sort((a, b) => b.id - a.id);
      setBooks(sorted);
    } catch (err) {
      console.error("Failed to fetch books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    setSelected(book);

    setTimeout(() => {
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  };

  const handleBookAdded = (newBook) => {
    setBooks((prev) => [newBook, ...prev]);

    setSelected(newBook);

    setShowModal(false);
    setModalBook(null);
    setManualTitle("");
  };

  const rows = chunkArray(books, 7);

  return (
    <div className="flex min-h-screen bg-[#f5ede0]">
      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{
          maxWidth: selected ? "calc(100% - 384px)" : "100%",
        }}
      >
        {/* HEADER */}

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold text-[#3d2b1f]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                The Bookshelf
              </h1>

              <p className="text-sm text-[#8b6b4e] mt-0.5">
                {books.length} books • sorted by newest
              </p>
            </div>

            {user && (
              <button
                onClick={() => {
                  setModalBook(null);
                  setManualTitle("");
                  setShowModal(true);
                }}
                className="bg-[#5c3d2e] hover:bg-[#3d2b1f] text-[#faf7f2] text-sm px-4 py-2 rounded-xl transition-colors"
              >
                + Add manually
              </button>
            )}
          </div>

          <SearchBar
            onSelectBook={(book) => {
              if (book.source === "db") {
                handleSelectBook(book);
              } else {
                setModalBook(book);
                setShowModal(true);
              }
            }}
            onAddManually={(title) => {
              setModalBook(null);
              setManualTitle(title);
              setShowModal(true);
            }}
          />
        </div>

        {/* BOOK GRID */}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-[#8b6b4e] text-sm animate-pulse">
              Dusting off the shelves...
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[#8b6b4e]">
              No books yet. Add the first one!
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="relative">
                <div className="flex items-end gap-3 px-4 pt-4 pb-2 min-h-[130px] flex-wrap">
                  {row.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onClick={handleSelectBook}
                    />
                  ))}
                </div>

                {/* Shelf */}

                <div className="relative h-5 mx-0">
                  <div className="h-3 bg-[#a0714f] rounded-sm shadow-md" />

                  <div className="h-2 bg-[#7a5233]" />

                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, transparent, transparent 40px, #3d2b1f 40px, #3d2b1f 41px)",
                    }}
                  />

                  <div className="absolute left-4 -bottom-3 w-3 h-4 bg-[#7a5233] rounded-b-sm" />

                  <div className="absolute right-4 -bottom-3 w-3 h-4 bg-[#7a5233] rounded-b-sm" />
                </div>

                <div className="h-6" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center opacity-30 text-2xl">
          🐱
        </div>
      </div>

      {/* RIGHT PANEL */}

      {selected && (
        <div
          ref={panelRef}
          className="w-96 border-l border-[#e0c9b0] bg-[#faf7f2] flex flex-col fixed right-0 top-0 bottom-0 overflow-y-auto z-10 shadow-xl"
        >
          <BookPanel
            book={selected}
            user={user}
            onClose={() => setSelected(null)}
            onBookDeleted={(id) => {
              setBooks((prev) => prev.filter((b) => b.id !== id));
              setSelected(null);
            }}
          />
        </div>
      )}

      {/* ADD BOOK MODAL */}

      {showModal && (
        <AddBookModal
          onClose={() => {
            setShowModal(false);
            setModalBook(null);
            setManualTitle("");
          }}
          onAdded={handleBookAdded}
          prefillBook={modalBook}
          prefillTitle={manualTitle}
        />
      )}
    </div>
  );
}