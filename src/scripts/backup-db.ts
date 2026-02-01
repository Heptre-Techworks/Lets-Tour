
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env
dotenv.config();

const backup = async () => {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URI;
  if (!uri) {
    console.error('Error: No MONGODB_URI or DATABASE_URI found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection failed');
    }

    const collections = await db.listCollections().toArray();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', timestamp);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`Starting backup to ${backupDir}`);

    for (const col of collections) {
      console.log(`Backing up collection: ${col.name}`);
      const data = await db.collection(col.name).find({}).toArray();
      fs.writeFileSync(
        path.join(backupDir, `${col.name}.json`),
        JSON.stringify(data, null, 2)
      );
    }

    console.log('Backup completed successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
};

backup();
