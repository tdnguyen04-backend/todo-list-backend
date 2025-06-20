require('dotenv').config();

const fs = require('fs')
const express = require('express');
const app = express();
const port = process.env.PORT || 3456;
const Database = require('better-sqlite3');


// Define the directory path
const dir = './SQLite';

// Check if the directory exists, and if not, create it
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true }); // Use recursive to create parent dirs if needed
    console.log(`Created directory: ${dir}`);
}


// Now, this line is guaranteed to work
const tasksDB = new Database(`${dir}/tasks.db`)

console.log('Successfully connected to the database.');


// Create table tasks
tasksDB.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )
`).run();



app.use(express.json());

app.get('/', (req, res) => {
  console.log('Someone jumped in the server')
  res.send(`<h1>Hello there</h1>`);
})

app.post('/tasks', (req, res) => {
  const data = req.body;
  const insertStmt = tasksDB.prepare('INSERT INTO tasks (id, name) VALUES (?, ?)');

  try {
    const lastTask = insertStmt.run(data.id, data.name)
    console.log(`Added task`, lastTask);
    return res.status(200).send({ success: true, msg: lastTask });
  } catch (error) {
    console.log(error.code);
    if (error.code == `SQLITE_CONSTRAINT_PRIMARYKEY`) {
      console.log(`Task already existed`)
      return res.status(409).send({ success: false, message: 'Task already exists.' });
    }
    return res.status(404).send({success: false, msg: `Other errors`});
  }
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})