//Создание и вставка элементов
function createCard(title, content) {
  const card = document.createElement('div');
  card.className = 'card';

  const heading = document.createElement('h4');
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = content;

  card.append(heading, paragraph);
  document.getElementById('target1').append(card);
  return card;
}

function createList(items) {
  const list = document.createElement('ol');
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  });
  document.getElementById('target1').append(list);
  return list;
}

//Навигация по DOM
function countChildren() {
  const parent = document.getElementById('parent-element');
  return parent ? parent.children.length : 0;
}

function findSpecialChild() {
  const special = document.querySelector('#parent-element .special');
  return special ? special.textContent.trim() : null;
}

function getParentBackground() {
  const child = document.querySelector('#parent-element .child');
  if (!child || !child.parentElement) return null;
  return getComputedStyle(child.parentElement).backgroundColor;
}

// Работа с классами и стилями
function setupStyleToggle() {
  const button = document.getElementById('toggle-style');
  const target = document.getElementById('style-target');
  if (!button || !target) return;
  button.addEventListener('click', () => target.classList.toggle('active-style'));
}

function changeHeaderColor() {
  const header = document.querySelector('header');
  if (!header) return null;
  const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  header.style.background = color;
  return color;
}

function animateElement() {
  const target = document.getElementById('style-target');
  if (!target) return;
  target.animate(
    [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.12)', opacity: 0.45 }, { transform: 'scale(1)', opacity: 1 }],
    { duration: 650, easing: 'ease-in-out' }
  );
}

//Обработка событий
function setupClickCounter() {
  const button = document.getElementById('click-btn');
  const output = document.getElementById('click-counter');
  if (!button || !output) return;
  let count = 0;
  button.addEventListener('click', () => {
    count += 1;
    output.textContent = `Кликов: ${count}`;
  });
}

function setupInputDisplay() {
  const input = document.getElementById('text-input');
  const display = document.getElementById('input-display');
  if (!input || !display) return;
  input.addEventListener('input', () => {
    display.textContent = input.value;
  });
}

function setupKeyboardEvents() {
  document.addEventListener('keydown', event => {
    console.log('keydown:', { code: event.code, key: event.key });
  });
  document.addEventListener('keyup', event => {
    console.log('keyup:', { code: event.code, key: event.key });
  });
}

//Динамические списки
function addListItem() {
  const input = document.getElementById('item-input');
  const list = document.getElementById('dynamic-list');
  if (!input || !list) return null;
  const value = input.value.trim();
  if (!value) {
    input.focus();
    return null;
  }

  const li = document.createElement('li');
  li.className = 'list-item';
  const text = document.createElement('span');
  text.textContent = value;
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Удалить';
  removeButton.className = 'remove-item';
  removeButton.setAttribute('aria-label', `Удалить элемент: ${value}`);
  li.append(text, removeButton);
  list.append(li);
  input.value = '';
  input.focus();
  return li;
}

function removeListItem(event) {
  const button = event.target.closest('button.remove-item');
  if (!button) return;
  const item = button.closest('li.list-item');
  if (item) item.remove();
}

function clearList() {
  const list = document.getElementById('dynamic-list');
  if (list) list.replaceChildren();
}

function setupListEvents() {
  const addButton = document.getElementById('add-item');
  const clearButton = document.getElementById('clear-list');
  const list = document.getElementById('dynamic-list');
  const input = document.getElementById('item-input');
  if (addButton) addButton.addEventListener('click', addListItem);
  if (clearButton) clearButton.addEventListener('click', clearList);
  if (list) list.addEventListener('click', removeListItem);
  if (input) input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addListItem();
    }
  });
}

//Работа с формами
function validateForm(formData) {
  const errors = {};
  const name = String(formData.name ?? '').trim();
  const email = String(formData.email ?? '').trim();
  const ageRaw = String(formData.age ?? '').trim();
  const age = Number(ageRaw);

  if (name.length < 2) errors.name = 'Имя должно содержать минимум 2 символа.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Введите корректный email.';
  if (!ageRaw || !Number.isInteger(age) || age < 1 || age > 120) errors.age = 'Возраст должен быть целым числом от 1 до 120.';

  return Object.keys(errors).length ? errors : null;
}

function displayFormErrors(errors) {
  const output = document.getElementById('form-output');
  if (!output) return;
  output.replaceChildren();
  output.className = 'error-message';

  const heading = document.createElement('strong');
  heading.textContent = 'Исправьте ошибки:';
  const list = document.createElement('ul');
  Object.values(errors || {}).forEach(message => {
    const li = document.createElement('li');
    li.textContent = message;
    list.append(li);
  });
  output.append(heading, list);
}

function displayFormSuccess(userData) {
  const output = document.getElementById('form-output');
  if (!output) return;
  output.replaceChildren();
  output.className = 'success-message';

  const heading = document.createElement('h4');
  heading.textContent = 'Форма успешно отправлена!';
  const details = document.createElement('p');
  details.textContent = `Имя: ${userData.name} | Email: ${userData.email} | Возраст: ${userData.age}`;
  output.append(heading, details);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    age: form.elements.age.value
  };
  const errors = validateForm(formData);
  if (errors) displayFormErrors(errors);
  else displayFormSuccess({ name: formData.name.trim(), email: formData.email.trim(), age: Number(formData.age) });
}

function setupForm() {
  const form = document.getElementById('user-form');
  if (form) form.addEventListener('submit', handleFormSubmit);
}

// Инициализация приложения
function initializeApp() {
  setupStyleToggle();
  setupClickCounter();
  setupInputDisplay();
  setupKeyboardEvents();
  setupListEvents();
  setupForm();

  createCard('Пример карточки', 'Это содержимое карточки, созданной через JavaScript.');
  createList(['Первый элемент', 'Второй элемент', 'Третий элемент']);

  const infoButton = document.getElementById('dom-info-btn');
  if (infoButton) infoButton.addEventListener('click', () => {
    const output = document.getElementById('dom-info');
    output.textContent = `Дочерних элементов: ${countChildren()}. Особый элемент: ${findSpecialChild()}. Цвет фона родителя: ${getParentBackground()}.`;
  });

  const colorButton = document.getElementById('change-header');
  if (colorButton) colorButton.addEventListener('click', changeHeaderColor);
  const animateButton = document.getElementById('animate-element');
  if (animateButton) animateButton.addEventListener('click', animateElement);

  console.log('Приложение DOM Manipulation инициализировано.');
}

document.addEventListener('DOMContentLoaded', initializeApp);
