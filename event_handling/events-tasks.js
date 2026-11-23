// Базовые обработчики событий
function handleBasicClick(event) {
  const output = document.getElementById('basic-output');
  if (output) {
    output.textContent = `Событие: ${event.type}; координаты: (${event.clientX}, ${event.clientY}); target: ${event.target.tagName}#${event.target.id || '(без id)'}`;
  }
  const button = event.currentTarget;
  button.classList.remove('pulse');
  void button.offsetWidth;
  button.classList.add('pulse');
  setTimeout(() => button.classList.remove('pulse'), 500);
}

function handleMouseEvents(event) {
  const box = event.currentTarget;
  const output = document.getElementById('mouse-output');
  if (event.type === 'mouseenter') box.style.backgroundColor = '#e74c3c';
  if (event.type === 'mouseleave') box.style.backgroundColor = '#3498db';
  if (event.type === 'mousemove' && output) {
    output.textContent = `Координаты мыши внутри блока: X=${event.offsetX}, Y=${event.offsetY}`;
  }
}

function setupBasicEvents() {
  document.getElementById('basic-btn')?.addEventListener('click', handleBasicClick);
  const box = document.getElementById('color-box');
  ['mouseenter', 'mouseleave', 'mousemove'].forEach(type => box?.addEventListener(type, handleMouseEvents));
}

// События клавиатуры
function handleKeyEvents(event) {
  const output = document.getElementById('key-output');
  let combo = '';
  const isCtrlS = event.ctrlKey && event.key.toLowerCase() === 's';
  const isAltC = event.altKey && event.key.toLowerCase() === 'c';
  const isShiftA = event.shiftKey && event.key.toLowerCase() === 'a';
  if (isCtrlS || isAltC || isShiftA) {
    event.preventDefault();
    combo = isCtrlS ? 'Перехвачена комбинация Ctrl+S' :
      isAltC ? 'Перехвачена комбинация Alt+C' : 'Перехвачена комбинация Shift+A';
  }
  if (output) {
    output.textContent = `key: ${event.key}; code: ${event.code}; ctrlKey: ${event.ctrlKey}; altKey: ${event.altKey}; shiftKey: ${event.shiftKey}${combo ? ' — ' + combo : ''}`;
  }
}
function setupKeyboardEvents() {
  const input = document.getElementById('key-input');
  input?.addEventListener('keydown', handleKeyEvents);
  input?.addEventListener('keyup', event => {
    if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') {
      const output = document.getElementById('key-output');
      if (output) output.textContent += ' (модификатор отпущен)';
    }
  });
}

// Делегирование событий
let nextItemId = 4;
function updateDelegationOutput() {
  const output = document.getElementById('delegation-output');
  const selected = [...document.querySelectorAll('#item-list .item.selected')]
    .map(item => item.textContent.replace('×', '').trim());
  if (output) output.textContent = selected.length ? `Выбранные элементы: ${selected.join(', ')}` : 'Выбранные элементы: нет';
}
function handleDelegationClick(event) {
  const list = event.currentTarget;
  const deleteButton = event.target.closest('.delete');
  if (deleteButton && list.contains(deleteButton)) {
    deleteButton.closest('.item')?.remove();
    updateDelegationOutput();
    return;
  }
  const item = event.target.closest('.item');
  if (item && list.contains(item)) {
    item.classList.toggle('selected');
    updateDelegationOutput();
  }
}
function addNewItem() {
  const list = document.getElementById('item-list');
  if (!list) return null;
  const id = nextItemId++;
  const item = document.createElement('div');
  item.className = 'item';
  item.dataset.id = String(id);
  item.append(document.createTextNode(`Элемент ${id} `));
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'delete';
  button.setAttribute('aria-label', 'Удалить');
  button.textContent = '×';
  item.append(button);
  list.append(item);
  return item;
}
function setupDelegationEvents() {
  document.getElementById('item-list')?.addEventListener('click', handleDelegationClick);
  document.getElementById('add-item-btn')?.addEventListener('click', addNewItem);
}

// ЗАДАНИЕ 4: Предотвращение поведения
function preventLinkDefault(event) {
  event.preventDefault();
  const output = document.getElementById('prevention-output');
  if (output) output.textContent = 'Переход по ссылке предотвращён (preventDefault).';
  const link = event.currentTarget;
  link.classList.remove('shake');
  void link.offsetWidth;
  link.classList.add('shake');
  setTimeout(() => link.classList.remove('shake'), 500);
}
function preventFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const value = form.elements.message.value.trim();
  const output = document.getElementById('prevention-output');
  if (!output) return;
  if (!value) {
    output.textContent = 'Ошибка: поле не должно быть пустым.';
    output.className = 'output error';
    form.elements.message.focus();
    return;
  }
  output.textContent = `Отправка формы предотвращена. Введенные данные: ${value}`;
  output.className = 'output success';
}
function setupPreventionEvents() {
  document.getElementById('prevent-link')?.addEventListener('click', preventLinkDefault);
  document.getElementById('prevent-form')?.addEventListener('submit', preventFormSubmit);
}

// ЗАДАНИЕ 5: Кастомные события
function triggerCustomEvent() {
  const customEvent = new CustomEvent('customAction', {
    detail: { message: 'Привет от кастомного события!' },
    bubbles: true
  });
  document.dispatchEvent(customEvent);
}
function handleCustomEvent(event) {
  const output = document.getElementById('custom-output');
  if (output) output.textContent = `Получено: ${event.detail?.message ?? 'нет данных'}`;
  const button = document.getElementById('trigger-custom');
  button?.classList.add('pulse');
  setTimeout(() => button?.classList.remove('pulse'), 500);
}
function setupMultipleListeners() {
  if (setupMultipleListeners.initialized) return;
  setupMultipleListeners.initialized = true;
  document.addEventListener('multiAction', () => appendCustomMessage('Обработчик №1: событие принято.'));
  document.addEventListener('multiAction', () => appendCustomMessage('Обработчик №2: выполнена дополнительная задача.'));
  document.addEventListener('multiAction', () => appendCustomMessage('Обработчик №3: все обработчики сработали.'));
  document.dispatchEvent(new CustomEvent('multiAction', { detail: { time: Date.now() } }));
}
function appendCustomMessage(message) {
  const output = document.getElementById('custom-output');
  if (!output) return;
  const line = document.createElement('p');
  line.textContent = message;
  output.append(line);
}
function setupCustomEvents() {
  document.addEventListener('customAction', handleCustomEvent);
  document.getElementById('trigger-custom')?.addEventListener('click', triggerCustomEvent);
  document.getElementById('multiple-listeners')?.addEventListener('click', setupMultipleListeners);
}

// ЗАДАНИЕ 6: События загрузки и ошибок
function loadImageWithEvents() {
  const container = document.getElementById('image-container');
  const output = document.getElementById('loading-output');
  if (!container || !output) return;
  container.replaceChildren();
  const img = document.createElement('img');
  img.alt = 'Загруженное тестовое изображение';
  img.width = 300;
  img.height = 200;
  img.style.objectFit = 'cover';
  img.addEventListener('load', () => {
    output.textContent = 'Изображение успешно загружено (load).';
    output.className = 'output success';
  }, { once: true });
  img.addEventListener('error', () => {
    output.textContent = 'Не удалось загрузить изображение (error). Проверьте подключение.';
    output.className = 'output error';
  }, { once: true });
  output.textContent = 'Загрузка изображения…';
  img.src = 'https://picsum.photos/300/200';
  container.append(img);
}
function simulateLoadError() {
  const container = document.getElementById('image-container');
  const output = document.getElementById('loading-output');
  if (!container || !output) return;
  container.replaceChildren();
  const img = document.createElement('img');
  img.alt = 'Изображение с ошибкой загрузки';
  img.addEventListener('error', () => {
    output.textContent = 'Ошибка загрузки обработана: ресурс не найден.';
    output.className = 'output error';
  }, { once: true });
  img.addEventListener('load', () => {
    output.textContent = 'Тестовый ресурс неожиданно загрузился.';
    output.className = 'output';
  }, { once: true });
  output.textContent = 'Проверяем ошибочный URL…';
  img.src = 'https://example.invalid/nonexistent-image.jpg';
  container.append(img);
}
function setupLoadingEvents() {
  document.getElementById('load-image')?.addEventListener('click', loadImageWithEvents);
  document.getElementById('load-error')?.addEventListener('click', simulateLoadError);
}

// Таймеры и асинхронные события
let timerInterval = null;
let timerValue = 0;
function startTimer() {
  if (timerInterval !== null) return;
  timerInterval = setInterval(() => {
    timerValue += 1;
    const output = document.getElementById('timer-output');
    if (output) output.textContent = `Таймер: ${timerValue}`;
  }, 1000);
}
function stopTimer() {
  if (timerInterval !== null) clearInterval(timerInterval);
  timerInterval = null;
  timerValue = 0;
  const output = document.getElementById('timer-output');
  if (output) output.textContent = 'Таймер: 0';
}
function createDebounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
function createThrottle(func, interval) {
  let lastCall = 0;
  let timeoutId = null;
  return function (...args) {
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    if (remaining <= 0) {
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
      lastCall = now;
      func.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}
function testDebounce() {
  const output = document.getElementById('async-output');
  if (!output) return;
  let ordinary = 0;
  let delayed = 0;
  output.textContent = 'Debounce: запускаем серию быстрых вызовов…';
  const ordinaryCall = () => { ordinary++; };
  const debouncedCall = createDebounce(() => { delayed++; }, 300);
  for (let i = 0; i < 6; i++) {
    ordinaryCall();
    debouncedCall();
  }
  setTimeout(() => {
    output.textContent = `Debounce: обычных вызовов ${ordinary}; вызовов после debounce ${delayed} (серия объединена в один).`;
  }, 400);
}
function testThrottle() {
  const output = document.getElementById('async-output');
  if (!output) return;
  let calls = 0;
  const throttled = createThrottle(() => calls++, 500);
  output.textContent = 'Throttle: имитируем 10 быстрых вызовов…';
  for (let i = 0; i < 10; i++) throttled();
  setTimeout(() => {
    output.textContent = `Throttle: из 10 быстрых запросов обработано ${calls} вызов(а), частота ограничена интервалом 500 мс.`;
  }, 600);
}
function setupTimerEvents() {
  document.getElementById('start-timer')?.addEventListener('click', startTimer);
  document.getElementById('stop-timer')?.addEventListener('click', stopTimer);
  document.getElementById('debounce-btn')?.addEventListener('click', testDebounce);
  document.getElementById('throttle-btn')?.addEventListener('click', testThrottle);
}

// Инициализация
function initializeEventsApp() {
  setupBasicEvents();
  setupKeyboardEvents();
  setupDelegationEvents();
  setupPreventionEvents();
  setupCustomEvents();
  setupLoadingEvents();
  setupTimerEvents();
  console.log('Практическая работа №12 инициализирована.');
}
document.addEventListener('DOMContentLoaded', initializeEventsApp);
