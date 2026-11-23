// Тесты функций 
function runEventsTests() {
  const results = [];
  const output = document.getElementById('test-results');
  const addResult = (name, ok, message='') => results.push({name, ok: !!ok, message: message || (ok ? 'Пройден' : 'Проверка не пройдена')});
  const testSync = (name, fn) => {
    try { addResult(name, fn() === true); }
    catch (e) { addResult(name, false, e.message); }
  };
  const testAsync = (name, fn) => {
    Promise.resolve().then(fn).then(ok => addResult(name, ok === true))
      .catch(e => addResult(name, false, e.message)).finally(render);
  };
  function render() {
    if (!output) return;
    output.replaceChildren();
    const passed = results.filter(r => r.ok).length;
    const summary = document.createElement('p');
    summary.textContent = `Пройдено ${passed} из ${results.length} тестов.`;
    output.append(summary);
    results.forEach(r => {
      const div = document.createElement('div');
      div.className = `test-result ${r.ok ? 'test-success' : 'test-failure'}`;
      div.textContent = `${r.ok ? '✓' : '✗'} ${r.name}: ${r.message}`;
      output.append(div);
    });
  }

  testSync('createDebounce возвращает функцию', () => typeof createDebounce(() => {}, 10) === 'function');
  testAsync('Debounce объединяет частые вызовы', () => new Promise(resolve => {
    let calls = 0;
    const debounced = createDebounce(() => calls++, 25);
    debounced(); debounced(); debounced();
    setTimeout(() => resolve(calls === 1), 60);
  }));
  testSync('createThrottle возвращает функцию', () => typeof createThrottle(() => {}, 20) === 'function');
  testSync('Throttle ограничивает быстрые вызовы', () => {
    let calls = 0;
    const throttled = createThrottle(() => calls++, 100);
    throttled(); throttled(); throttled();
    return calls === 1;
  });
  testSync('addNewItem создает элемент с data-id', () => {
    const list = document.getElementById('item-list');
    const count = list.children.length;
    const item = addNewItem();
    const valid = item instanceof HTMLElement && !!item.dataset.id && list.children.length === count + 1;
    item?.remove();
    return valid;
  });
  testSync('Делегирование переключает класс selected', () => {
    const item = document.querySelector('#item-list .item');
    const previous = item.classList.contains('selected');
    handleDelegationClick({target:item, currentTarget:document.getElementById('item-list')});
    const changed = item.classList.contains('selected') !== previous;
    handleDelegationClick({target:item, currentTarget:document.getElementById('item-list')});
    return changed && item.classList.contains('selected') === previous;
  });
  testSync('Кастомное событие передает detail.message', () => {
    let received = false;
    const listener = e => received = e.detail.message === 'Привет от кастомного события!';
    document.addEventListener('customAction', listener, {once:true});
    triggerCustomEvent();
    return received;
  });
  testSync('Валидация предотвращенной формы выявляет пустое значение', () => {
    const form = document.getElementById('prevent-form');
    const output = document.getElementById('prevention-output');
    form.elements.message.value = '';
    preventFormSubmit({preventDefault(){}, currentTarget:form});
    return output.textContent.includes('Ошибка');
  });
  testSync('stopTimer сбрасывает счетчик', () => {
    const output = document.getElementById('timer-output');
    timerValue = 8;
    stopTimer();
    return timerValue === 0 && output.textContent === 'Таймер: 0';
  });
  testSync('clear selected selection report handles empty selection', () => {
    document.querySelectorAll('#item-list .item.selected').forEach(el => el.classList.remove('selected'));
    updateDelegationOutput();
    return document.getElementById('delegation-output').textContent.includes('нет');
  });
  // Async result may finish after sync; update render each time
  render();
  return results;
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('run-tests')?.addEventListener('click', runEventsTests);
});
