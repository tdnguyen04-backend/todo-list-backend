const fs = require('fs')
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
// Define the directory path
const dir = './SQLite';

// // Check if the directory exists, and if not, create it
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true }); // Use recursive to create parent dirs if needed
  console.log(`Created directory: ${dir}`);
}

// Now, this line is guaranteed to work
const tasksDB = new Database(`${dir}/tasks.db`, { fileMustExist: false })

// Create table tasks
tasksDB.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )
`).run();

const insertStmt = tasksDB.prepare(`
  INSERT INTO tasks (id, name) 
  VALUES (?, ?)
  RETURNING *
`);

const insertTask = (req, res) => {
  const data = req.body;

  try {
    const uuid = uuidv4()
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

module.exports = { insertTask }