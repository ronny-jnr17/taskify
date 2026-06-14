const express = require('express');
const router = express.Router();
const db = require('./db');

// GET all tasks
router.get('/', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST create a task
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required.' });
  }

  db.query(
    'INSERT INTO tasks (title, description) VALUES (?, ?)',
    [title.trim(), description ? description.trim() : ''],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: result.insertId,
        title: title.trim(),
        description: description || '',
        status: 'pending'
      });
    }
  );
});

// PUT update a task
router.put('/:id', (req, res) => {
  const { title, description, status } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const validStatuses = ['pending', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  db.query(
    'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
    [title.trim(), description ? description.trim() : '', status || 'pending', req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found.' });
      res.json({ message: 'Task updated successfully.' });
    }
  );
});

// DELETE a task
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted successfully.' });
  });
});

module.exports = router;
