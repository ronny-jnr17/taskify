const API = 'http://localhost:3000/api/tasks';

let tasks = [];
let editingId = null;

// ── FETCH ALL TASKS ──────────────────────────────────────────
async function loadTasks() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error();
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    console.error('Load error:', err);
  }
}

// ── RENDER TASKS ─────────────────────────────────────────────
function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('task-count');

  count.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

  if (tasks.length === 0) {
    list.innerHTML = '';
    list.appendChild(empty);
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = tasks.map(task => `
    <div class="task-item ${task.status}" id="task-${task.id}">
      <div class="task-info">
        <div class="task-title">${escapeHTML(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
        <span class="task-badge badge-${task.status}">
          ${task.status === 'completed' ? '✓ Completed' : '● Pending'}
        </span>
      </div>
      <div class="task-actions">
        <button class="btn-icon" onclick="editTask(${task.id})" title="Edit">Edit</button>
        <button class="btn-icon delete" onclick="deleteTask(${task.id})" title="Delete">Delete</button>
      </div>
    </div>
  `).join('');
}

// ── SUBMIT (ADD OR UPDATE) ────────────────────────────────────
async function submitTask() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const status = document.getElementById('status').value;
  const titleError = document.getElementById('title-error');
  const titleInput = document.getElementById('title');

  // Validation
  if (!title) {
    titleInput.classList.add('invalid');
    titleError.classList.add('visible');
    titleInput.focus();
    return;
  }

  titleInput.classList.remove('invalid');
  titleError.classList.remove('visible');

  if (editingId) {
    // UPDATE
    try {
      const res = await fetch(`${API}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status })
      });
      if (!res.ok) throw new Error();
      await loadTasks();
      cancelEdit();
      showToast('Task updated!');
    } catch {
      showToast('Failed to update task.', true);
    }
  }
   else {
    // CREATE
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (!res.ok) throw new Error();
      showToast('Task added!');
      clearForm();
      loadTasks();
    } catch {
      showToast('Failed to add task.', true);
    }
  }
}

// ── EDIT TASK ─────────────────────────────────────────────────
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingId = id;
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description || '';
  document.getElementById('status').value = task.status;

  document.getElementById('form-title').textContent = 'Edit Task';
  document.getElementById('btn-label').textContent = 'Save Changes';
  document.getElementById('status-field').style.display = 'flex';
  document.getElementById('cancel-btn').style.display = 'inline-block';

  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

// ── DELETE TASK ───────────────────────────────────────────────
async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Task deleted.');
    loadTasks();
  } catch {
    showToast('Failed to delete task.', true);
  }
}

// ── CANCEL EDIT ───────────────────────────────────────────────
function cancelEdit() {
  editingId = null;
  clearForm();
  document.getElementById('form-title').textContent = 'Add New Task';
  document.getElementById('btn-label').textContent = 'Add Task';
  document.getElementById('status-field').style.display = 'none';
  document.getElementById('cancel-btn').style.display = 'none';
}

// ── HELPERS ───────────────────────────────────────────────────
function clearForm() {
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('status').value = 'pending';
  document.getElementById('title').classList.remove('invalid');
  document.getElementById('title-error').classList.remove('visible');
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimeout;
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast') || createToast();
  toast.textContent = msg;
  toast.style.background = isError ? '#b02020' : '#2d2a26';
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

function createToast() {
  const t = document.createElement('div');
  t.id = 'toast';
  t.className = 'toast';
  document.body.appendChild(t);
  return t;
}

// ── INIT ──────────────────────────────────────────────────────
loadTasks();
