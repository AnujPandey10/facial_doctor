import fs from 'fs';
import path from 'path';
import { query } from '../db/database';

async function migrate() {
  try {
    console.log('Running database migration...');
    
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await query(schema);
    
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

