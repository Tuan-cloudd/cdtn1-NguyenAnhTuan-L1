const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { all, exec, run } = require('./connection');

const migrationsDirectory = path.join(__dirname, '..', '..', 'migrations');
const seedsDirectory = path.join(__dirname, '..', '..', 'seeds');

async function migrate() {
  await exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const appliedRows = await all('SELECT migration_name FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.migration_name));
  const migrations = fs.readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of migrations) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDirectory, file), 'utf8');
    await exec('BEGIN TRANSACTION;');
    try {
      await exec(sql);
      await run('INSERT INTO schema_migrations (migration_name) VALUES (?)', [file]);
      await exec('COMMIT;');
    } catch (error) {
      await exec('ROLLBACK;');
      throw error;
    }
  }

  const seedFiles = fs.readdirSync(seedsDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();
  for (const file of seedFiles) {
    await exec(fs.readFileSync(path.join(seedsDirectory, file), 'utf8'));
  }
}

if (require.main === module) {
  migrate().then(() => {
    console.log('Database migrations and seeds completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Database migration failed:', error);
    process.exit(1);
  });
}

module.exports = migrate;
