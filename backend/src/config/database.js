import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import ws from 'ws';
import dotenv from 'dotenv';
dotenv.config();

let dbClient;

const databaseUrl = process.env.DATABASE_URL;

// Custom QueryBuilder wrapper to mock Supabase client over pg.Pool
class QueryBuilder {
  constructor(pool, table) {
    this.pool = pool;
    this.table = table;
    this.operation = 'select'; // 'select', 'insert', 'update', 'delete', 'upsert'
    this.selectColumns = '*';
    this.whereClauses = [];
    this.orderBy = null;
    this.limitVal = null;
    this.insertData = null;
    this.updateData = null;
    this.upsertData = null;
    this.upsertConflict = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
  }

  insert(data) {
    this.operation = 'insert';
    this.insertData = data;
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.updateData = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert(data, options = {}) {
    this.operation = 'upsert';
    this.upsertData = data;
    this.upsertConflict = options.onConflict;
    return this;
  }

  eq(column, value) {
    this.whereClauses.push({ column, operator: '=', value });
    return this;
  }

  gte(column, value) {
    this.whereClauses.push({ column, operator: '>=', value });
    return this;
  }

  lte(column, value) {
    this.whereClauses.push({ column, operator: '<=', value });
    return this;
  }

  ilike(column, value) {
    this.whereClauses.push({ column, operator: 'ILIKE', value });
    return this;
  }

  order(column, options = {}) {
    const direction = options.ascending === false ? 'DESC' : 'ASC';
    this.orderBy = `ORDER BY "${column}" ${direction}`;
    return this;
  }

  limit(num) {
    this.limitVal = `LIMIT ${num}`;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  // Handles both .from(table).select(...) and .insert(...).select()
  select(columns = '*') {
    // If we are already doing insert/update/upsert, .select() is a no-op chainable
    // as our raw pg queries already return rows via RETURNING *
    if (this.operation === 'select') {
      this.selectColumns = columns;
    }
    return this;
  }

  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute() {
    let sql = '';
    const params = [];
    let valIndex = 1;

    if (this.operation === 'select') {
      const selectStr = this.selectColumns === '*' ? '*' : this.selectColumns.split(',').map(col => {
        const trimmed = col.trim();
        if (trimmed === '*') return '*';
        return `"${trimmed}"`;
      }).join(', ');

      const whereClausesSql = [];
      for (const clause of this.whereClauses) {
        whereClausesSql.push(`"${clause.column}" ${clause.operator} $${valIndex++}`);
        params.push(clause.value);
      }
      const whereSql = whereClausesSql.length > 0 ? `WHERE ${whereClausesSql.join(' AND ')}` : '';
      sql = `SELECT ${selectStr} FROM "${this.table}" ${whereSql} ${this.orderBy || ''} ${this.limitVal || ''}`;

    } else if (this.operation === 'insert') {
      const isArray = Array.isArray(this.insertData);
      const rows = isArray ? this.insertData : [this.insertData];
      if (rows.length === 0) {
        return { data: [], error: null };
      }
      const keys = Object.keys(rows[0]);
      const columnsStr = keys.map(k => `"${k}"`).join(', ');

      const valuePlaceholders = [];
      for (const row of rows) {
        const rowPlaceholders = [];
        for (const key of keys) {
          rowPlaceholders.push(`$${valIndex++}`);
          params.push(row[key]);
        }
        valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
      }
      sql = `INSERT INTO "${this.table}" (${columnsStr}) VALUES ${valuePlaceholders.join(', ')} RETURNING *`;

    } else if (this.operation === 'update') {
      const keys = Object.keys(this.updateData);
      const setClauses = [];
      for (const key of keys) {
        setClauses.push(`"${key}" = $${valIndex++}`);
        params.push(this.updateData[key]);
      }
      const whereClausesSql = [];
      for (const clause of this.whereClauses) {
        whereClausesSql.push(`"${clause.column}" ${clause.operator} $${valIndex++}`);
        params.push(clause.value);
      }
      const whereSql = whereClausesSql.length > 0 ? `WHERE ${whereClausesSql.join(' AND ')}` : '';
      sql = `UPDATE "${this.table}" SET ${setClauses.join(', ')} ${whereSql} RETURNING *`;

    } else if (this.operation === 'delete') {
      const whereClausesSql = [];
      for (const clause of this.whereClauses) {
        whereClausesSql.push(`"${clause.column}" ${clause.operator} $${valIndex++}`);
        params.push(clause.value);
      }
      const whereSql = whereClausesSql.length > 0 ? `WHERE ${whereClausesSql.join(' AND ')}` : '';
      sql = `DELETE FROM "${this.table}" ${whereSql} RETURNING *`;

    } else if (this.operation === 'upsert') {
      const isArray = Array.isArray(this.upsertData);
      const rows = isArray ? this.upsertData : [this.upsertData];
      if (rows.length === 0) {
        return { data: [], error: null };
      }
      const keys = Object.keys(rows[0]);
      const columnsStr = keys.map(k => `"${k}"`).join(', ');

      const valuePlaceholders = [];
      for (const row of rows) {
        const rowPlaceholders = [];
        for (const key of keys) {
          rowPlaceholders.push(`$${valIndex++}`);
          params.push(row[key]);
        }
        valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
      }

      let conflictAction = 'DO NOTHING';
      if (this.upsertConflict) {
        const conflictCols = this.upsertConflict.split(',').map(c => `"${c.trim()}"`).join(', ');
        const conflictKeys = this.upsertConflict.split(',').map(c => c.trim());
        const updateKeys = keys.filter(k => !conflictKeys.includes(k));
        if (updateKeys.length > 0) {
          const updateSets = updateKeys.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');
          conflictAction = `ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateSets}`;
        } else {
          conflictAction = `ON CONFLICT (${conflictCols}) DO NOTHING`;
        }
      }
      sql = `INSERT INTO "${this.table}" (${columnsStr}) VALUES ${valuePlaceholders.join(', ')} ${conflictAction} RETURNING *`;
    }

    try {
      const res = await this.pool.query(sql, params);
      const data = res.rows;

      if (this.isSingle) {
        if (data.length === 0) {
          return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
        }
        return { data: data[0], error: null };
      }
      if (this.isMaybeSingle) {
        return { data: data.length > 0 ? data[0] : null, error: null };
      }
      return { data, error: null };
    } catch (err) {
      console.error(`❌ [Database Error] SQL: ${sql} | Error:`, err.message);
      return { data: null, error: err };
    }
  }
}

function mockSupabaseClient(pool) {
  return {
    from(table) {
      return new QueryBuilder(pool, table);
    }
  };
}

if (databaseUrl) {
  const useSsl = databaseUrl.includes('supabase.co') || 
                 databaseUrl.includes('render.com') || 
                 databaseUrl.includes('neon.tech') || 
                 process.env.DB_SSL === 'true';

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  console.log('🐘 [Database] Conectado diretamente ao PostgreSQL via pg.Pool.');
  dbClient = mockSupabaseClient(pool);
} else {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ [Database] Configuração ausente. Forneça DATABASE_URL para Postgres local ou SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  dbClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    realtime: { transport: ws },
  });

  console.log('🐘 [Database] Conectado via API cliente do Supabase.');
}

export default dbClient;
