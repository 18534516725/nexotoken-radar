import mysql, { type Pool, type PoolConnection } from 'mysql2/promise';

let pool: Pool | undefined;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error('RADAR_DATABASE_UNAVAILABLE');
  return value;
}

export function databasePool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: required('RADAR_DB_HOST'), port: Number(process.env.RADAR_DB_PORT || '3306'),
      user: required('RADAR_DB_USER'), password: required('RADAR_DB_PASSWORD'), database: required('RADAR_DB_NAME'),
      connectionLimit: Number(process.env.RADAR_DB_POOL_SIZE || '8'), waitForConnections: true,
      queueLimit: 20, timezone: 'Z', charset: 'utf8mb4', enableKeepAlive: true,
    });
  }
  return pool;
}

export async function withTransaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await databasePool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
