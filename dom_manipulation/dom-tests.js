// Самостоятельные тесты функций 


function runDomTests() {
  const results = [];
  const output = document.getElementById('test-results');

  function test(name, callback) {
    try {
      const passed = callback() === true;
      results.push({ name, passed, message: passed ? 'Успешно' : 'Проверка вернула false' });
    } catch (error) {
      results.push({ name, passed: false, message: error.message });
    }
  }

  // Для проверки создания временно очищаем контейнер и затем возвращаем исходный контент.
  test('createCard создает карточку с заголовком и текстом', () => {
    const target = document.getElementById('target1');
    const before = target.children.length;
    const card = createCard('Тест', 'Контент');
    const valid = card.classList.contains('card') &&
      card.querySelector('h4')?.textContent === 'Тест' &&
      card.querySelector('p')?.textContent === 'Контент' &&
      target.children.length === before + 1;
    card.remove();
    return valid;
  });

  test('createList создает нумерованный список', () => {
    const target = document.getElementById('target1');
    const before = target.children.length;
    const list = createList(['A', 'B']);
    const valid = list.tagName === 'OL' && list.children.length === 2 &&
      list.children[0].textContent === 'A' && target.children.length === before + 1;
    list.remove();
    return valid;
  });

  test('countChildren возвращает количество прямых дочерних элементов', () =>
    countChildren() === 3);

  test('findSpecialChild находит особый элемент', () =>
    findSpecialChild() === 'Особый дочерний элемент');

  test('getParentBackground возвращает цвет фона', () =>
    typeof getParentBackground() === 'string' && getParentBackground().length > 0);

  test('validateForm принимает корректные данные', () =>
    validateForm({ name: 'Иван', email: 'ivan@example.com', age: '18' }) === null);

  test('validateForm проверяет короткое имя, email и возраст', () => {
    const errors = validateForm({ name: 'И', email: 'bad-email', age: '0' });
    return !!errors && !!errors.name && !!errors.email && !!errors.age;
  });

  test('validateForm отклоняет дробный возраст', () =>
    !!validateForm({ name: 'Иван', email: 'ivan@example.com', age: '18.5' }));

  test('validateForm принимает граничный возраст 120', () =>
    validateForm({ name: 'Анна', email: 'a@b.co', age: '120' }) === null);

  test('validateForm отклоняет возраст больше 120', () =>
    !!validateForm({ name: 'Анна', email: 'a@b.co', age: '121' }));

  if (output) {
    output.replaceChildren();
    const passedCount = results.filter(result => result.passed).length;
    const summary = document.createElement('p');
    summary.textContent = `Пройдено ${passedCount} из ${results.length} тестов.`;
    output.append(summary);

    results.forEach(result => {
      const div = document.createElement('div');
      div.className = `test-result ${result.passed ? 'test-success' : 'test-failure'}`;
      div.textContent = `${result.passed ? '✓' : '✗'} ${result.name}: ${result.message}`;
      output.append(div);
    });
  }

  console.table(results);
  return results;
}

document.addEventListener('DOMContentLoaded', () => {
  const runButton = document.getElementById('run-tests');
  if (runButton) runButton.addEventListener('click', runDomTests);
});
