// =============================================
// DATABASE - localStorage as simulated db.json
// =============================================
const DB = {
  KEY: 'taskflow_db',

  _load() {
    const raw = localStorage.getItem(this.KEY);
    if (raw) return JSON.parse(raw);
    const initial = { users: [], todos: [] };
    this._save(initial);
    return initial;
  },

  _save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  getUsers() { return this._load().users; },
  getTodos() { return this._load().todos; },

  addUser(user) {
    const db = this._load();
    db.users.push(user);
    this._save(db);
  },

  findUserByEmail(email) {
    return this.getUsers().find(u => u.email === email.toLowerCase());
  },

  addTodo(todo) {
    const db = this._load();
    db.todos.push(todo);
    this._save(db);
  },

  updateTodo(id, changes) {
    const db = this._load();
    const idx = db.todos.findIndex(t => t.id === id);
    if (idx !== -1) db.todos[idx] = { ...db.todos[idx], ...changes };
    this._save(db);
  },

  deleteTodo(id) {
    const db = this._load();
    db.todos = db.todos.filter(t => t.id !== id);
    this._save(db);
  },

  getTodosByUser(userId) {
    return this.getTodos().filter(t => t.userId === userId);
  },

  deleteDoneTodosByUser(userId) {
    const db = this._load();
    db.todos = db.todos.filter(t => !(t.userId === userId && t.done));
    this._save(db);
  }
};

// =============================================
// SESSION
// =============================================
const Session = {
  KEY: 'currentUser',
  get() { const r = localStorage.getItem(this.KEY); return r ? JSON.parse(r) : null; },
  set(u) { localStorage.setItem(this.KEY, JSON.stringify(u)); },
  clear() { localStorage.removeItem(this.KEY); }
};

// =============================================
// ROUTER
// =============================================
let currentFilter = 'all';

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${name}`);
  if (el) el.classList.add('active');
}

// =============================================
// UTILS
// =============================================
function setError(fieldId, msgId, message) {
  const field = document.getElementById(fieldId);
  const msg = document.getElementById(msgId);
  if (!field || !msg) return;
  field.classList.add('error-field');
  msg.classList.add('visible');
  msg.querySelector('span').textContent = message;
}

function clearError(fieldId, msgId) {
  const field = document.getElementById(fieldId);
  const msg = document.getElementById(msgId);
  if (!field || !msg) return;
  field.classList.remove('error-field');
  msg.classList.remove('visible');
}

function showAlert(alertId, message) {
  const el = document.getElementById(alertId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function hideAlert(alertId) {
  const el = document.getElementById(alertId);
  if (el) el.classList.remove('visible');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

// =============================================
// AUTH — Login
// =============================================
function initLogin() {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('login-email').addEventListener('input', () => {
    clearError('login-email', 'login-email-error');
    hideAlert('login-alert');
  });
  document.getElementById('login-password').addEventListener('input', () => {
    clearError('login-password', 'login-password-error');
    hideAlert('login-alert');
  });
}

function handleLogin(e) {
  e.preventDefault();
  hideAlert('login-alert');
  clearError('login-email', 'login-email-error');
  clearError('login-password', 'login-password-error');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  let valid = true;

  if (!email) { setError('login-email', 'login-email-error', 'Informe seu e-mail.'); valid = false; }
  else if (!isValidEmail(email)) { setError('login-email', 'login-email-error', 'E-mail inválido.'); valid = false; }
  if (!password) { setError('login-password', 'login-password-error', 'Informe sua senha.'); valid = false; }
  if (!valid) return;

  const user = DB.findUserByEmail(email);
  if (!user) {
    showAlert('login-alert', 'E-mail não cadastrado. Verifique ou crie uma conta.');
    setError('login-email', 'login-email-error', 'E-mail não encontrado.');
    return;
  }
  if (user.password !== password) {
    showAlert('login-alert', 'Senha incorreta. Tente novamente.');
    setError('login-password', 'login-password-error', 'Senha incorreta.');
    return;
  }

  Session.set({ id: user.id, name: user.name, email: user.email });
  openDashboard();
}

// =============================================
// AUTH — Cadastro
// =============================================
function initRegister() {
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('reg-name').addEventListener('input', () => clearError('reg-name', 'reg-name-error'));
  document.getElementById('reg-email').addEventListener('input', () => { clearError('reg-email', 'reg-email-error'); hideAlert('register-alert'); });
  document.getElementById('reg-password').addEventListener('input', () => clearError('reg-password', 'reg-password-error'));
}

function handleRegister(e) {
  e.preventDefault();
  hideAlert('register-alert');
  clearError('reg-name', 'reg-name-error');
  clearError('reg-email', 'reg-email-error');
  clearError('reg-password', 'reg-password-error');

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  let valid = true;

  if (!name) { setError('reg-name', 'reg-name-error', 'Nome é obrigatório.'); valid = false; }
  if (!email) { setError('reg-email', 'reg-email-error', 'E-mail é obrigatório.'); valid = false; }
  else if (!isValidEmail(email)) { setError('reg-email', 'reg-email-error', 'E-mail inválido.'); valid = false; }
  if (!password) { setError('reg-password', 'reg-password-error', 'Senha é obrigatória.'); valid = false; }
  else if (password.length < 6) { setError('reg-password', 'reg-password-error', 'Mínimo 6 caracteres.'); valid = false; }
  if (!valid) return;

  if (DB.findUserByEmail(email)) {
    showAlert('register-alert', 'Esse e-mail já está cadastrado.');
    setError('reg-email', 'reg-email-error', 'E-mail já em uso.');
    return;
  }

  const newUser = { id: generateId(), name, email: email.toLowerCase(), password };
  DB.addUser(newUser);
  Session.set({ id: newUser.id, name: newUser.name, email: newUser.email });
  openDashboard();
}

// =============================================
// BADGE CONFIG
// =============================================
const BADGE_CONFIG = {
  Trabalho: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  Pessoal:  { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  Estudos:  { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)' }
};

// =============================================
// DASHBOARD
// =============================================
function openDashboard() {
  const user = Session.get();
  if (!user) { showScreen('login'); return; }

  document.getElementById('nav-user').textContent = `Olá, ${user.name.split(' ')[0]}`;
  document.getElementById('greeting-text').textContent = `Olá, ${user.name.split(' ')[0]}! ✨`;
  currentFilter = 'all';
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('filter-all').classList.add('active');

  showScreen('dashboard');
  renderTodos();
}

function renderTodos() {
  const user = Session.get();
  const allTodos = DB.getTodosByUser(user.email);
  const list = document.getElementById('todo-list');
  const statsBadge = document.getElementById('stats-badge');
  const clearBtn = document.getElementById('btn-clear-done');

  const total = allTodos.length;
  const done = allTodos.filter(t => t.done).length;

  statsBadge.textContent = `${done}/${total} concluída${done !== 1 ? 's' : ''}`;
  clearBtn.style.display = done > 0 ? 'inline' : 'none';

  let filtered = allTodos;
  if (currentFilter === 'active') filtered = allTodos.filter(t => !t.done);
  if (currentFilter === 'done') filtered = allTodos.filter(t => t.done);

  // Sort: pending first, done last
  filtered.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));

  list.innerHTML = '';

  if (filtered.length === 0) {
    const msgs = {
      all: { icon: '📋', text: 'Nenhuma tarefa cadastrada ainda.' },
      active: { icon: '🎉', text: 'Nenhuma tarefa ativa. Tudo em dia!' },
      done: { icon: '✨', text: 'Nenhuma tarefa concluída ainda.' }
    };
    const m = msgs[currentFilter];
    list.innerHTML = `<div class="empty-state slide-down"><div style="font-size:2.5rem;margin-bottom:12px;">${m.icon}</div><p style="font-size:0.9rem;">${m.text}</p></div>`;
    return;
  }

  filtered.forEach(todo => {
    const badge = BADGE_CONFIG[todo.type] || BADGE_CONFIG.Pessoal;
    const card = document.createElement('div');
    card.className = `todo-card slide-down${todo.done ? ' done' : ''}`;
    card.dataset.id = todo.id;

    let descHtml = '';
    if (todo.description) {
      descHtml = `<p class="todo-desc">${escapeHtml(todo.description)}</p>`;
    }

    card.innerHTML = `
      <div class="todo-card-header">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
            <span class="type-badge" style="background:${badge.bg};color:${badge.color};border:1px solid ${badge.border};">${escapeHtml(todo.type)}</span>
          </div>
          ${descHtml}
        </div>
        <div class="todo-actions">
          ${!todo.done ? `<button class="btn-conclude" title="Concluir"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Concluir</button>` : '<span class="done-label">✓ Concluída</span>'}
          <button class="btn-delete-card" title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
        </div>
      </div>`;

    if (!todo.done) {
      card.querySelector('.btn-conclude').addEventListener('click', () => {
        DB.updateTodo(todo.id, { done: true });
        renderTodos();
      });
    }

    card.querySelector('.btn-delete-card').addEventListener('click', () => {
      DB.deleteTodo(todo.id);
      renderTodos();
    });

    list.appendChild(card);
  });
}

function handleAddTodo() {
  hideAlert('todo-add-alert');
  clearError('todo-title', 'todo-title-error');

  const titleInput = document.getElementById('todo-title');
  const typeSelect = document.getElementById('todo-type');
  const descInput = document.getElementById('todo-desc');

  const title = titleInput.value.trim();
  const type = typeSelect.value;
  const description = descInput.value.trim();

  if (!title) {
    setError('todo-title', 'todo-title-error', 'O título é obrigatório.');
    titleInput.focus();
    return;
  }

  const user = Session.get();
  DB.addTodo({
    id: Date.now(),
    userId: user.email,
    title,
    type,
    description,
    done: false
  });

  titleInput.value = '';
  descInput.value = '';
  typeSelect.value = 'Trabalho';
  titleInput.focus();
  renderTodos();
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initRegister();

  document.getElementById('goto-register').addEventListener('click', () => {
    document.getElementById('register-form').reset();
    hideAlert('register-alert');
    showScreen('register');
  });

  document.getElementById('goto-login').addEventListener('click', () => {
    document.getElementById('login-form').reset();
    hideAlert('login-alert');
    showScreen('login');
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    Session.clear();
    document.getElementById('login-form').reset();
    hideAlert('login-alert');
    showScreen('login');
  });

  document.getElementById('btn-add-todo').addEventListener('click', handleAddTodo);
  document.getElementById('todo-title').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTodo(); }
  });

  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  document.getElementById('btn-clear-done').addEventListener('click', () => {
    const user = Session.get();
    DB.deleteDoneTodosByUser(user.email);
    renderTodos();
  });

  const session = Session.get();
  if (session) openDashboard();
  else showScreen('login');
});
