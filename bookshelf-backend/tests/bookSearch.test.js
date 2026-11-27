// MOCKS: replace the database and the network so tests are fast and isolated
jest.mock('../db/pool', () => ({ query: jest.fn() }));
jest.mock('axios');

const axios = require('axios');
const pool = require('../db/pool');
const { searchBooks } = require('../services/bookSearch');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Local search strategy', () => {
  test('returns [] for a query shorter than 2 chars without touching the DB', async () => {
    const result = await searchBooks('local', 'a');

    expect(result).toEqual([]);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('queries the DB with a wildcard pattern and returns the rows', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, title: 'Dune' }] });

    const result = await searchBooks('local', 'dun');

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query.mock.calls[0][1]).toEqual(['%dun%']);
    expect(result).toEqual([{ id: 1, title: 'Dune' }]);
  });
});

describe('Google search strategy', () => {
  test('calls Google Books and adapts the results', async () => {
    axios.get.mockResolvedValue({
      data: {
        items: [
          {
            id: 'g1',
            volumeInfo: { title: 'Dune', authors: ['Frank Herbert'] },
          },
        ],
      },
    });

    const result = await searchBooks('google', 'dune', { startIndex: 20 });

    const params = axios.get.mock.calls[0][1].params;
    expect(params.q).toBe('dune');
    expect(params.startIndex).toBe(20);
    expect(result[0].google_id).toBe('g1');
    expect(result[0].author).toBe('Frank Herbert');
  });

  test('returns [] when Google has no items', async () => {
    axios.get.mockResolvedValue({ data: {} });

    expect(await searchBooks('google', 'zzzz')).toEqual([]);
  });

  test('returns [] for an empty query without calling Google', async () => {
    expect(await searchBooks('google', '')).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('lets network errors through so the route can answer 500', async () => {
    axios.get.mockRejectedValue(new Error('network down'));

    await expect(searchBooks('google', 'dune')).rejects.toThrow('network down');
  });
});

describe('searchBooks (strategy selection)', () => {
  test('throws on an unknown source', () => {
    expect(() => searchBooks('alien', 'dune')).toThrow('Unknown search source');
  });
});