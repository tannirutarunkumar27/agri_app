import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// Environment connection variables for Supabase PostgreSQL
const connectionString =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  ''

// Global pool instance to prevent connection exhaustion in Next.js hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var __farmos_pg_pool__: Pool | undefined
}

function createPool(): Pool {
  if (!connectionString) {
    console.warn(
      '[FarmOS DB] No database connection string detected. Please set SUPABASE_DATABASE_URL in .env.local to connect to your Supabase PostgreSQL database.'
    )
  }

  // Supabase PostgreSQL connection pooler configuration optimized for serverless execution
  const pool = new Pool({
    connectionString: connectionString || undefined,
    // Keep per-container pool small (2-3) to prevent connection pool exhaustion across serverless lambdas
    max: process.env.NODE_ENV === 'production' ? 3 : 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 5000,
    ssl:
      !connectionString || connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false }
  })

  pool.on('error', (err) => {
    console.error('[FarmOS DB] Unexpected PostgreSQL client error:', err)
  })

  return pool
}

export function getPool(): Pool {
  if (process.env.NODE_ENV === 'production') {
    if (!global.__farmos_pg_pool__) {
      global.__farmos_pg_pool__ = createPool()
    }
    return global.__farmos_pg_pool__
  }

  if (!global.__farmos_pg_pool__) {
    global.__farmos_pg_pool__ = createPool()
  }
  return global.__farmos_pg_pool__
}

/**
 * Automatically converts SQLite-style positional `?` placeholders to PostgreSQL `$1, $2, ...`
 * If the query already uses PostgreSQL `$1`, `$2`, it leaves it untouched.
 */
export function normalizeQuery(sql: string): string {
  if (!sql.includes('?')) return sql

  let paramIndex = 1
  let insideSingleQuote = false
  let insideDoubleQuote = false
  let output = ''

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]

    if (char === "'" && (i === 0 || sql[i - 1] !== '\\')) {
      insideSingleQuote = !insideSingleQuote
      output += char
    } else if (char === '"' && (i === 0 || sql[i - 1] !== '\\')) {
      insideDoubleQuote = !insideDoubleQuote
      output += char
    } else if (char === '?' && !insideSingleQuote && !insideDoubleQuote) {
      output += `$${paramIndex++}`
    } else {
      output += char
    }
  }

  return output
}

/**
 * Execute a query against the PostgreSQL pool and return all matched rows
 */
export async function query<T extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getPool()
  const normalizedSql = normalizeQuery(sql)
  const result: QueryResult<T> = await pool.query<T>(normalizedSql, params)
  return result.rows
}

/**
 * Execute a query and return the first matched row or null
 */
export async function queryOne<T extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

/**
 * Execute a mutation query (INSERT, UPDATE, DELETE) and return row count
 */
export async function execute(sql: string, params: any[] = []): Promise<{ rowCount: number }> {
  const pool = getPool()
  const normalizedSql = normalizeQuery(sql)
  const result = await pool.query(normalizedSql, params)
  return { rowCount: result.rowCount || 0 }
}

export interface TransactionContext {
  query: <T extends QueryResultRow = any>(sql: string, params?: any[]) => Promise<T[]>
  queryOne: <T extends QueryResultRow = any>(sql: string, params?: any[]) => Promise<T | null>
  execute: (sql: string, params?: any[]) => Promise<{ rowCount: number }>
  rawClient: PoolClient
}

/**
 * Execute a unit of work inside an ACID atomic transaction in PostgreSQL.
 * If the callback succeeds, changes are committed.
 * If any error is thrown, the entire transaction is immediately rolled back.
 */
export async function runTransaction<T>(
  callback: (tx: TransactionContext) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const tx: TransactionContext = {
      rawClient: client,
      query: async <R extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<R[]> => {
        const normalized = normalizeQuery(sql)
        const res = await client.query<R>(normalized, params)
        return res.rows
      },
      queryOne: async <R extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<R | null> => {
        const normalized = normalizeQuery(sql)
        const res = await client.query<R>(normalized, params)
        return res.rows.length > 0 ? res.rows[0] : null
      },
      execute: async (sql: string, params: any[] = []): Promise<{ rowCount: number }> => {
        const normalized = normalizeQuery(sql)
        const res = await client.query(normalized, params)
        return { rowCount: res.rowCount || 0 }
      }
    }

    const result = await callback(tx)
    await client.query('COMMIT')
    return result
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // rollback error suppressed
    }
    throw error
  } finally {
    client.release()
  }
}
