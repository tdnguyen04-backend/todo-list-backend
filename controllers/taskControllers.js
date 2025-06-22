const fs = require('fs')
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
// Define the directory path
const dir = './SQLite';

const dbPath = `${dir}/tasks.db`;

// --- NEW: Database Management ---
// Let's use `let` so we can reassign it after closing/deleting the DB.
let tasksDB;

// A function to initialize the database connection.
// This will create the file and table if they don't exist.
const initializeDB = () => {
  // Ensure the directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }

  // Create a new database connection
  tasksDB = new Database(dbPath, { fileMustExist: false });
  console.log('Database connection opened.');

  // Create table `tasks` if it doesn't already exist
  tasksDB.prepare(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `).run();
};

// --- NEW: A getter for the DB ---
// This function ensures we always have a valid, open DB connection.
const getDB = () => {
  // If the DB is null or not open, initialize it.
  if (!tasksDB || !tasksDB.open) {
    console.log('No active DB connection found. Initializing...');
    initializeDB();
  }
  return tasksDB;
};

// Initialize the DB for the first time when the app starts.
initializeDB();

const insertTask = (req, res) => {
  const data = req.body;

  try {
    const db = getDB()

    const uuid = uuidv4()
    const insertStmt = db.prepare(`
      INSERT INTO tasks (id, name) 
      VALUES (?, ?)
      RETURNING *
    `);
    const insertedTask = insertStmt.get(uuid, data.name)
    console.log(insertedTask)
    return res.status(201).send({ success: true, newTask: insertedTask });
  } catch (error) {
    // Log the actual error for your own debugging
    console.error('Failed to insert task:', error);

    // Send a generic, safe error message to the client
    return res.status(500).send({ success: false, message: 'An unexpected error occurred while creating the task.' });
  }
}

const deleteTaskTable = (req, res) => {
  try {
    const db = getDB();
    const deleteTableStmt = db.prepare(`
      DROP TABLE tasks  
    `)
    deleteTableStmt.run();
    db.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      res.status(200).send({ success: true, message: 'Table `tasks` and file `tasks.db` have been deleted.' });
    } else {
      res.status(200).send({ success: true, message: 'File `tasks.db` did not exist, but connection was closed.' });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ success: false, message: 'An unexpected error occurred while creating the task.' });
  }
}

module.exports = { insertTask, deleteTaskTable }