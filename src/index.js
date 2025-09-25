import './style.css';
import Display from './methods.js';
import Interactive from './interactive.js';

const $ = sel => document.querySelector(sel);
const listEl = $('#list');
const inputEl = $('#taskInput');
const formEl = $('#taskForm');
const leftCount = $('#leftCount');
const clearBtn = $('#clearCompleted');
const resetBtn = $('#reset');
const filters = document.querySelectorAll('.filter');

let currentFilter = 'all'; // 'all' | 'active' | 'completed'

function setFilter(name){
  currentFilter = name;
  filters.forEach(b => {
    const active = b.dataset.filter === name;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  render();
}

function applyFilter(list){
  if (currentFilter === 'active') return list.filter(t => !t.completed);
  if (currentFilter === 'completed') return list.filter(t => t.completed);
  return list;
}

function createItemEl(item){
  const li = document.createElement('li');
  li.className = 'item' + (item.completed ? ' completed' : '');
  li.dataset.index = String(item.index);

  // checkbox
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'checkbox';
  cb.checked = item.completed;
  cb.addEventListener('change', () => {
    Interactive.toggleCompleted(item.index, cb.checked);
  });

  // title (inline edit)
  const wrap = document.createElement('div');
  wrap.className = 'title-wrap';
  const input = document.createElement('input');
  input.className = 'title';
  input.value = item.description;
  input.readOnly = true;

  function commitEdit(){
    const next = input.value.trim();
    input.classList.remove('editing');
    input.readOnly = true;
    if (next.length === 0) { // delete empty
      Display.remove(item.index);
      window.dispatchEvent(new CustomEvent('todos:updated'));
      return;
    }
    Display.update(item.index, { description: next });
    window.dispatchEvent(new CustomEvent('todos:updated'));
  }

  input.addEventListener('dblclick', () => {
    input.readOnly = false;
    input.classList.add('editing');
    input.focus();
    const len = input.value.length;
    input.setSelectionRange(len, len);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      input.value = item.description;
      input.classList.remove('editing');
      input.readOnly = true;
    }
  });
  input.addEventListener('blur', () => {
    if (!input.readOnly) commitEdit();
  });

  wrap.appendChild(input);

  // actions
  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon';
  editBtn.title = 'Edit';
  editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
  editBtn.addEventListener('click', () => {
    input.readOnly = false;
    input.classList.add('editing');
    input.focus();
    const len = input.value.length;
    input.setSelectionRange(len, len);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'icon danger';
  delBtn.title = 'Delete';
  delBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
  delBtn.addEventListener('click', () => {
    Display.remove(item.index);
    window.dispatchEvent(new CustomEvent('todos:updated'));
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(cb);
  li.appendChild(wrap);
  li.appendChild(actions);
  return li;
}

function render(){
  const all = Display.getAll();
  const filtered = applyFilter(all);
  listEl.innerHTML = '';
  filtered.forEach(item => listEl.appendChild(createItemEl(item)));

  const left = all.filter(t => !t.completed).length;
  leftCount.textContent = `${left} item${left === 1 ? '' : 's'} left`;
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = inputEl.value.trim();
  if (!value) return;
  Display.add(value);
  inputEl.value = '';
  window.dispatchEvent(new CustomEvent('todos:updated'));
});

clearBtn.addEventListener('click', () => Interactive.clearCompleted());

resetBtn.addEventListener('click', () => {
  localStorage.removeItem('LocalDataList');
  window.dispatchEvent(new CustomEvent('todos:updated'));
});

filters.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));

window.addEventListener('todos:updated', render);
window.addEventListener('load', render);
