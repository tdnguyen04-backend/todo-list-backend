require('dotenv').config();


const express = require('express');
const app = express();
const port = process.env.PORT || 3456;

const {insertTask, deleteTaskTable} = require('./controllers/taskControllers')

console.log('Successfully connected to the database.');

app.use(express.json());

// app.get('/tasks', getAllTasks)

app.post('/tasks', insertTask)

app.delete('/tasksSchema', deleteTaskTable)

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})