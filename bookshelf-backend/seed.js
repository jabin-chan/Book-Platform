
const pool = require('./db/pool');

const books = [
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    description: 'Between life and death there is a library. When Nora Seed finds herself there, she has a chance to undo her regrets and try out any life she could have lived.',
    published_year: 2020,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    description: 'A practical guide to building good habits and breaking bad ones using tiny changes that deliver remarkable results.',
    published_year: 2018,
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    description: 'A desert planet, a chosen one, and an empire at stake. One of the greatest science fiction novels ever written.',
    published_year: 1965,
  },
  {
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    genre: 'Fantasy',
    description: 'The tale of Kvothe — a legendary wizard and musician — told in his own words on the day he decided to stop hiding.',
    published_year: 2007,
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    genre: 'Memoir',
    description: 'A memoir about a girl who grows up in the mountains of Idaho with no formal education, and eventually earns a PhD from Cambridge.',
    published_year: 2018,
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: 'Science Fiction',
    description: 'A lone astronaut wakes up with no memory, millions of miles from Earth, and must figure out how to save humanity.',
    published_year: 2021,
  },
  {
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    genre: 'Historical Fiction',
    description: 'A reclusive Hollywood legend finally tells the truth about her glamorous, scandalous life to an unknown journalist.',
    published_year: 2017,
  },
  {
    title: 'Normal People',
    author: 'Sally Rooney',
    genre: 'Literary Fiction',
    description: 'Two people from the same small Irish town navigate love, class, and identity as they move through university and adulthood.',
    published_year: 2018,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: 'Non-Fiction',
    description: 'A brief history of humankind — from the Stone Age to the present — exploring how biology and history shaped us.',
    published_year: 2011,
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    description: 'A young shepherd travels from Spain to Egypt in search of treasure, and discovers what he was really looking for along the way.',
    published_year: 1988,
  },
];

const seed = async () => {
  console.log('🌱 Seeding books...');

  for (const book of books) {
    // INSERT ... ON CONFLICT DO NOTHING means:
    // if a book with the same title already exists, skip it
    // so you can safely run this script multiple times
    await pool.query(
      `INSERT INTO books (title, author, genre, description, published_year)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [book.title, book.author, book.genre, book.description, book.published_year]
    );
    console.log(`  ✓ ${book.title}`);
  }

  console.log('✅ Done! Books are in the database.');
  process.exit(0); // close the script cleanly when finished
};

//run
seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});