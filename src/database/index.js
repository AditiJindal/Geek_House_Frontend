import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Messages from './MessagesModel';
import MessagesSchema from './MessagesSchema';

// import Post from './model/Post' // ⬅️ You'll import your Models here

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema:MessagesSchema,
  dbName:'messages'
})

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [Messages],
  actionsEnabled: true,
})