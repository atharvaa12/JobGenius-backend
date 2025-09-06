const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.SESSION_POOLER_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Handle unexpected errors on idle clients (prevent crash)
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // You can optionally restart the app here if needed
});

/**
 * Query with automatic retry on transient DB errors
 * @param {string} text SQL query text
 * @param {Array} params Query parameters
 * @param {number} retries Number of retries left (default 3)
 * @returns Promise resolving to query result
 */
async function query(text, params = [], retries = 3) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    // List of transient error codes/messages to retry on
    const transientErrors = [
      '57P01', // admin_shutdown
      '57P02', // crash_shutdown
      '08006', // connection_failure
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'EPIPE',
      'XX000', // internal_error
    ];

    const isTransient = transientErrors.some(
      (code) =>
        err.code === code || (err.message && err.message.includes(code))
    );

    if (retries > 0 && isTransient) {
      console.warn(`Transient DB error detected (${err.code || err.message}). Retrying query... attempts left: ${retries}`);
      await new Promise((res) => setTimeout(res, 1000)); // wait 1 sec before retry
      return query(text, params, retries - 1);
    }

    throw err; // rethrow if no retries left or not a transient error
  }
}
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK'); // if this fails, it'll throw up naturally
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  withTransaction,
  pool,
};
