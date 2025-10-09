// src/lib/MSSQLStore.ts
import { Store } from 'express-session';
import sql from 'mssql';
import { getDashboardConnection } from '@/lib/db';

export default class MSSQLStore extends Store {
  private tableName: string = 'Sessions';

  constructor(tableName?: string) {
    super();
    if (tableName) this.tableName = tableName;

    // สร้างตารางถ้ายังไม่มี
    this.ensureTable();
  }

  private async ensureTable() {
    try {
      const pool = await getDashboardConnection();
      const createTableQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='${this.tableName}' and xtype='U')
        CREATE TABLE ${this.tableName} (
          session_id NVARCHAR(255) PRIMARY KEY,
          data NVARCHAR(MAX),
          expires DATETIME
        )
      `;
      await pool.request().query(createTableQuery);
    } catch (err) {
      console.error('❌ Error creating session table:', err);
    }
  }

  async get(sid: string, callback: (err: any, session?: any | null) => void) {
    try {
      const pool = await getDashboardConnection();
      const result = await pool.request()
        .input('sid', sql.NVarChar, sid)
        .query(`SELECT data, expires FROM ${this.tableName} WHERE session_id = @sid`);

      if (result.recordset.length === 0) return callback(null, null);

      const { data, expires } = result.recordset[0];
      if (expires < new Date()) {
        await this.destroy(sid);
        return callback(null, null);
      }

      callback(null, JSON.parse(data));
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, sessionData: any, callback?: (err?: any) => void) {
    try {
      const pool = await getDashboardConnection();
      const expires = sessionData.cookie?.expires
        ? new Date(sessionData.cookie.expires)
        : new Date(Date.now() + 86400000); // 1 วัน

      const data = JSON.stringify(sessionData);

      const query = `
        MERGE ${this.tableName} AS target
        USING (SELECT @sid AS session_id) AS source
        ON (target.session_id = source.session_id)
        WHEN MATCHED THEN 
          UPDATE SET data = @data, expires = @expires
        WHEN NOT MATCHED THEN
          INSERT (session_id, data, expires) VALUES (@sid, @data, @expires);
      `;

      await pool.request()
        .input('sid', sql.NVarChar, sid)
        .input('data', sql.NVarChar(sql.MAX), data)
        .input('expires', sql.DateTime, expires)
        .query(query);

      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      const pool = await getDashboardConnection();
      await pool.request()
        .input('sid', sql.NVarChar, sid)
        .query(`DELETE FROM ${this.tableName} WHERE session_id = @sid`);
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }
}
