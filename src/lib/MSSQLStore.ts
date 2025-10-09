import { Store, SessionData } from 'express-session';
import sql from 'mssql';
import { getDashboardConnection } from '@/lib/db';

export default class MSSQLStore extends Store {
    private tableName: string = 'Sessions';

    constructor(tableName?: string) {
        super();
        if (tableName) this.tableName = tableName;

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

    // method get ตาม interface Store
    get(sid: string, callback: (err: Error | null, session?: SessionData | null) => void): void {
        getDashboardConnection()
            .then(pool =>
                pool
                    .request()
                    .input('sid', sql.NVarChar, sid)
                    .query(`SELECT data, expires FROM ${this.tableName} WHERE session_id = @sid`)
            )
            .then(result => {
                if (result.recordset.length === 0) return callback(null, null);

                const { data, expires } = result.recordset[0];
                if (expires < new Date()) {
                    this.destroy(sid, () => {
                        callback(null, null);
                    });
                    return;
                }

                try {
                    const session = JSON.parse(data) as SessionData;
                    callback(null, session);
                } catch (err) {
                    if (err instanceof Error) {
                        callback(err);
                    } else {
                        callback(new Error(String(err)));
                    }
                }
            })
            .catch(err => {
                if (err instanceof Error) {
                    callback(err);
                } else {
                    callback(new Error(String(err)));
                }
            });
    }

    set(sid: string, session: SessionData, callback?: (err?: Error) => void): void {
        getDashboardConnection()
            .then(pool => {
                let expires: Date;
                if (session.cookie?.expires) {
                    if (typeof session.cookie.expires === 'string') {
                        expires = new Date(session.cookie.expires);
                    } else if (session.cookie.expires instanceof Date) {
                        expires = session.cookie.expires;
                    } else {
                        expires = new Date(Date.now() + 86400000);
                    }
                } else {
                    expires = new Date(Date.now() + 86400000);
                }

                const data = JSON.stringify(session);

                const query = `
        MERGE ${this.tableName} AS target
        USING (SELECT @sid AS session_id) AS source
        ON (target.session_id = source.session_id)
        WHEN MATCHED THEN
          UPDATE SET data = @data, expires = @expires
        WHEN NOT MATCHED THEN
          INSERT (session_id, data, expires) VALUES (@sid, @data, @expires);
      `;

                return pool
                    .request()
                    .input('sid', sql.NVarChar, sid)
                    .input('data', sql.NVarChar(sql.MAX), data)
                    .input('expires', sql.DateTime, expires)
                    .query(query);
            })
            .then(() => {
                if (callback) callback();
            })
            .catch(err => {
                if (callback) {
                    if (err instanceof Error) callback(err);
                    else callback(new Error(String(err)));
                }
            });
    }

    // method destroy ตาม interface Store
    destroy(sid: string, callback?: (err?: Error) => void): void {
        getDashboardConnection()
            .then(pool =>
                pool
                    .request()
                    .input('sid', sql.NVarChar, sid)
                    .query(`DELETE FROM ${this.tableName} WHERE session_id = @sid`)
            )
            .then(() => {
                if (callback) callback();
            })
            .catch(err => {
                if (callback) callback(err);
            });
    }
}
