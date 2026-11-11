// Тесты для functions.js. Работают в браузере (index.html) и в Node.js: node tests.js

if (typeof module !== 'undefined' && module.exports && typeof sum === 'undefined') {
    Object.assign(globalThis, require('./functions.js'));
}

const IS_BROWSER = typeof document !== 'undefined';
let passedTests = 0;
let failedTests = 0;

// ---------- Мини-фреймворк ----------

function show(testName, ok, expected, actual) {
    ok ? passedTests++ : failedTests++;
    const status = ok ? '✅ УСПЕХ' : '❌ ОШИБКА';

    if (IS_BROWSER) {
        const el = document.createElement('div');
        el.className = `test-result ${ok ? 'success' : 'error'}`;
        el.innerHTML = `<strong>${testName}:</strong> ${status}` +
            (ok ? '' : `<br>Ожидалось: ${expected}<br>Получено: ${actual}`);
        document.getElementById('testResults').appendChild(el);
    }
    console.log(`${testName}:`, status, ok ? '' : { expected, actual });
}

// Сравнение значений (JSON; undefined/NaN выводятся читаемо)
function repr(value) {
    if (value === undefined) return 'undefined';
    if (typeof value === 'number' && Number.isNaN(value)) return 'NaN';
    return JSON.stringify(value);
}

function runTest(testName, actual, expected) {
    show(testName, repr(actual) === repr(expected), repr(expected), repr(actual));
}

// Тест на выброс исключения заданного типа
function runThrowsTest(testName, fn, ErrorType = Error) {
    try {
        fn();
        show(testName, false, `исключение ${ErrorType.name}`, 'исключения не было');
    } catch (e) {
        show(testName, e instanceof ErrorType, `исключение ${ErrorType.name}`, e && e.name);
    }
}

// Асинхронный тест (для debounce/throttle)
async function runAsyncTest(testName, fn) {
    try {
        const { actual, expected } = await fn();
        runTest(testName, actual, expected);
    } catch (e) {
        show(testName, false, 'без ошибок', String(e));
    }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// ---------- Описание заданий на странице ----------

function renderTasksInfo() {
    if (!IS_BROWSER) return;
    const tasks = [
        ['Часть 2', 'sum, createUser, secretMessage'],
        ['Часть 3', 'compose, myMap, myFilter, myReduce'],
        ['Часть 4', 'curry, memoize, debounce, throttle, createValidator']
    ];
    document.getElementById('tasksInfo').innerHTML = tasks
        .map(([title, list]) => `<div class="task"><strong>${title}:</strong> <code>${list}</code></div>`)
        .join('');
}

// ---------- Тесты ----------

function testPart2() {
    console.log('--- Часть 2 ---');
    // sum
    runTest('sum(1, 2, 3)', sum(1, 2, 3), 6);
    runTest('sum() — без аргументов', sum(), 0);
    runTest('sum(5) — один аргумент', sum(5), 5);
    runTest('sum(-1, 1)', sum(-1, 1), 0);
    runTest('sum(0.1, 0.2) ≈ 0.3', Math.abs(sum(0.1, 0.2) - 0.3) < 1e-9, true);
    runTest('sum(...[1, 2, 3, 4])', sum(...[1, 2, 3, 4]), 10);
    runThrowsTest('sum(1, "2") бросает TypeError', () => sum(1, '2'), TypeError);
    runThrowsTest('sum(NaN) бросает TypeError', () => sum(NaN), TypeError);

    // createUser
    runTest('createUser с email', createUser({ name: 'Анна', age: 25, email: 'anna@mail.ru' }),
        'Пользователь: Анна, возраст: 25, email: anna@mail.ru');
    runTest('createUser без email', createUser({ name: 'Иван', age: 30 }),
        'Пользователь: Иван, возраст: 30, email: не указан');
    runTest('createUser с email: undefined', createUser({ name: 'Олег', age: 18, email: undefined }),
        'Пользователь: Олег, возраст: 18, email: не указан');
    runTest('createUser с age = 0', createUser({ name: 'Малыш', age: 0 }),
        'Пользователь: Малыш, возраст: 0, email: не указан');

    // secretMessage
    const secret = secretMessage('qwerty', 'Привет, мир');
    runTest('secretMessage: верный пароль', secret('qwerty'), 'Привет, мир');
    runTest('secretMessage: неверный пароль', secret('123'), 'Доступ запрещен');
    runTest('secretMessage: без пароля', secret(), 'Доступ запрещен');
    runTest('secretMessage: регистр важен', secret('QWERTY'), 'Доступ запрещен');
    runTest('secretMessage: независимые замыкания', secretMessage('a', 'A')('b'), 'Доступ запрещен');
    runTest('secretMessage: повторные вызовы', [secret('qwerty'), secret('x'), secret('qwerty')],
        ['Привет, мир', 'Доступ запрещен', 'Привет, мир']);
}

function testPart3() {
    console.log('--- Часть 3 ---');
    const add1 = x => x + 1;
    const double = x => x * 2;
    const square = x => x * x;

    // compose
    runTest('compose(add1, double)(5) = add1(double(5))', compose(add1, double)(5), 11);
    runTest('compose(double, add1)(5) = double(add1(5))', compose(double, add1)(5), 12);
    runTest('compose(add1, double, square)(3)', compose(add1, double, square)(3), 19);
    runTest('compose() — тождественная функция', compose()(42), 42);
    runTest('compose(f) — одна функция', compose(double)(4), 8);
    runTest('compose: первая функция принимает несколько аргументов',
        compose(double, (a, b) => a + b)(2, 3), 10);
    runTest('compose со строками', compose(s => s.toUpperCase(), s => s.trim())('  hi '), 'HI');
    runTest('pipe(add1, double)(5) = double(add1(5))', pipe(add1, double)(5), 12);

    // myMap
    runTest('myMap: умножение на 2', myMap([1, 2, 3], double), [2, 4, 6]);
    runTest('myMap: пустой массив', myMap([], double), []);
    runTest('myMap: передаёт индекс', myMap(['a', 'b'], (x, i) => x + i), ['a0', 'b1']);
    runTest('myMap: передаёт массив третьим аргументом', myMap([1, 2], (x, i, arr) => arr.length), [2, 2]);
    const original = [1, 2, 3];
    myMap(original, double);
    runTest('myMap: не изменяет исходный массив', original, [1, 2, 3]);
    runTest('myMap совпадает с Array.map', myMap([1, 2, 3], square), [1, 2, 3].map(square));
    runThrowsTest('myMap: не массив → TypeError', () => myMap('abc', double), TypeError);
    runThrowsTest('myMap: callback не функция → TypeError', () => myMap([1], null), TypeError);

    // myFilter
    runTest('myFilter: чётные', myFilter([1, 2, 3, 4, 5, 6], x => x % 2 === 0), [2, 4, 6]);
    runTest('myFilter: ничего не подходит', myFilter([1, 3], x => x % 2 === 0), []);
    runTest('myFilter: всё подходит', myFilter([2, 4], x => x % 2 === 0), [2, 4]);
    runTest('myFilter: пустой массив', myFilter([], () => true), []);
    runTest('myFilter: использует индекс', myFilter(['a', 'b', 'c'], (x, i) => i !== 1), ['a', 'c']);
    runTest('myFilter: truthy/falsy значения', myFilter([0, 1, '', 'a', null], Boolean), [1, 'a']);
    runThrowsTest('myFilter: callback не функция → TypeError', () => myFilter([1], 5), TypeError);

    // myReduce
    runTest('myReduce: сумма с initialValue', myReduce([1, 2, 3, 4], (a, b) => a + b, 0), 10);
    runTest('myReduce: сумма без initialValue', myReduce([1, 2, 3, 4], (a, b) => a + b), 10);
    runTest('myReduce: initialValue для пустого массива', myReduce([], (a, b) => a + b, 7), 7);
    runTest('myReduce: один элемент без initialValue', myReduce([5], (a, b) => a + b), 5);
    runTest('myReduce: initialValue = 0 учитывается', myReduce([1, 2], (a, b) => a - b, 0), -3);
    runTest('myReduce: строка из массива', myReduce(['a', 'b', 'c'], (acc, x) => acc + x, ''), 'abc');
    runTest('myReduce: объект-аккумулятор',
        myReduce(['a', 'b', 'a'], (acc, x) => { acc[x] = (acc[x] || 0) + 1; return acc; }, {}), { a: 2, b: 1 });
    runTest('myReduce: индекс начинается с 1 без initialValue',
        myReduce([10, 20, 30], (acc, x, i) => acc + i, 0), 3);
    runThrowsTest('myReduce: пустой массив без initialValue → TypeError',
        () => myReduce([], (a, b) => a + b), TypeError);
    runThrowsTest('myReduce: callback не функция → TypeError', () => myReduce([1], 'x', 0), TypeError);
}

function testPart4Sync() {
    console.log('--- Часть 4 (синхронные) ---');

    // curry
    const add3 = (a, b, c) => a + b + c;
    const curried = curry(add3);
    runTest('curry: f(1)(2)(3)', curried(1)(2)(3), 6);
    runTest('curry: f(1, 2)(3)', curried(1, 2)(3), 6);
    runTest('curry: f(1)(2, 3)', curried(1)(2, 3), 6);
    runTest('curry: f(1, 2, 3)', curried(1, 2, 3), 6);
    const add1 = curried(1);
    runTest('curry: частичное применение переиспользуется', [add1(2)(3), add1(10)(10)], [6, 21]);
    runTest('curry: функция с одним аргументом', curry(x => x * 2)(4), 8);
    runTest('curry: функция без аргументов', curry(() => 'ok')(), 'ok');
    runTest('curry: четыре аргумента', curry((a, b, c, d) => a * b * c * d)(1)(2)(3)(4), 24);
    runThrowsTest('curry: не функция → TypeError', () => curry(123), TypeError);

    // memoize
    let calls = 0;
    const slowSquare = memoize(x => { calls++; return x * x; });
    runTest('memoize: первый вызов', slowSquare(4), 16);
    runTest('memoize: повторный вызов', slowSquare(4), 16);
    runTest('memoize: функция вызвана один раз', calls, 1);
    slowSquare(5);
    runTest('memoize: новый аргумент — новый вызов', calls, 2);

    let calls2 = 0;
    const multi = memoize((a, b) => { calls2++; return a + b; });
    multi(1, 2); multi(1, 2); multi(2, 1);
    runTest('memoize: несколько аргументов (разный порядок — разные ключи)', calls2, 2);

    let calls3 = 0;
    const returnsUndefined = memoize(() => { calls3++; return undefined; });
    returnsUndefined(); returnsUndefined();
    runTest('memoize: кэширует и результат undefined', calls3, 1);

    let calls4 = 0;
    const withObject = memoize(o => { calls4++; return o.x; });
    withObject({ x: 1 }); withObject({ x: 1 });
    runTest('memoize: объекты с одинаковым содержимым', calls4, 1);

    const fib = memoize(n => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
    runTest('memoize: рекурсивный fib(50) считается быстро', fib(50), 12586269025);
    runThrowsTest('memoize: не функция → TypeError', () => memoize(null), TypeError);

    // createValidator
    const validate = createValidator({ minLength: 8, requireDigit: true, requireUppercase: true });
    runTest('validator: корректный пароль', validate('Password1').valid, true);
    runTest('validator: корректный пароль — нет ошибок', validate('Password1').errors, []);
    runTest('validator: слишком короткий', validate('Pass1').valid, false);
    runTest('validator: без цифр', validate('Passwordd').errors, ['Должна быть хотя бы одна цифра']);
    runTest('validator: без заглавных', validate('password1').errors,
        ['Должна быть хотя бы одна заглавная буква']);
    runTest('validator: все ошибки сразу', validate('abc').errors.length, 3);
    runTest('validator: ровно minLength', validate('Abcdefg1').valid, true);
    runTest('validator: длина minLength - 1', validate('Abcdef1').valid, false);
    runTest('validator: пустая строка', validate('').valid, false);
    runTest('validator: кириллическая заглавная', validate('Парольчик1').valid, true);
    runTest('validator: не строка', validate(12345678).valid, false);
    runTest('validator: undefined', validate(undefined).valid, false);
    runTest('validator: без опций — всё валидно', createValidator()('').valid, true);
    runTest('validator: только minLength', createValidator({ minLength: 3 })('abc').valid, true);
    runTest('validator: независимые валидаторы',
        [createValidator({ requireDigit: true })('abc').valid, createValidator()('abc').valid], [false, true]);
}

async function testPart4Async() {
    console.log('--- Часть 4 (debounce / throttle, асинхронные) ---');

    await runAsyncTest('debounce: серия вызовов → один вызов с последними аргументами', async () => {
        const calls = [];
        const d = debounce(x => calls.push(x), 50);
        d(1); d(2); d(3);
        await wait(120);
        return { actual: calls, expected: [3] };
    });

    await runAsyncTest('debounce: не вызывается до истечения задержки', async () => {
        const calls = [];
        const d = debounce(x => calls.push(x), 80);
        d(1);
        await wait(20);
        return { actual: calls, expected: [] };
    });

    await runAsyncTest('debounce: вызовы с паузой больше delay выполняются отдельно', async () => {
        const calls = [];
        const d = debounce(x => calls.push(x), 30);
        d('a');
        await wait(80);
        d('b');
        await wait(80);
        return { actual: calls, expected: ['a', 'b'] };
    });

    await runAsyncTest('debounce: каждый вызов сбрасывает таймер', async () => {
        const calls = [];
        const d = debounce(() => calls.push(1), 60);
        d(); await wait(40);
        d(); await wait(40);
        d(); await wait(40);
        const during = calls.length;
        await wait(100);
        return { actual: [during, calls.length], expected: [0, 1] };
    });

    await runAsyncTest('debounce: cancel() отменяет вызов', async () => {
        const calls = [];
        const d = debounce(() => calls.push(1), 30);
        d(); d.cancel();
        await wait(80);
        return { actual: calls, expected: [] };
    });

    await runAsyncTest('debounce: сохраняет this', async () => {
        const obj = { value: 42, run: debounce(function () { obj.seen = this.value; }, 20) };
        obj.run();
        await wait(60);
        return { actual: obj.seen, expected: 42 };
    });

    await runAsyncTest('throttle: первый вызов выполняется сразу', async () => {
        const calls = [];
        const t = throttle(x => calls.push(x), 100);
        t(1);
        const actual = [...calls];
        t.cancel();
        return { actual, expected: [1] };
    });

    await runAsyncTest('throttle: серия быстрых вызовов — первый сразу, последний в конце интервала', async () => {
        const calls = [];
        const t = throttle(x => calls.push(x), 80);
        t(1); t(2); t(3);
        const immediately = [...calls];
        await wait(150);
        return { actual: [immediately, calls], expected: [[1], [1, 3]] };
    });

    await runAsyncTest('throttle: вызовы реже интервала проходят все', async () => {
        const calls = [];
        const t = throttle(x => calls.push(x), 30);
        t('a'); await wait(60);
        t('b'); await wait(60);
        return { actual: calls, expected: ['a', 'b'] };
    });

    await runAsyncTest('throttle: за 250 мс при интервале 100 мс — не более 4 вызовов', async () => {
        let count = 0;
        const t = throttle(() => count++, 100);
        const start = Date.now();
        while (Date.now() - start < 250) { t(); await wait(10); }
        await wait(120);
        t.cancel();
        return { actual: count >= 2 && count <= 4, expected: true };
    });

    await runAsyncTest('throttle: cancel() отменяет отложенный вызов', async () => {
        const calls = [];
        const t = throttle(x => calls.push(x), 60);
        t(1); t(2); t.cancel();
        await wait(120);
        return { actual: calls, expected: [1] };
    });
}

// ---------- Запуск ----------

async function runAllTests() {
    console.log('=== ЗАПУСК ТЕСТОВ ===');
    renderTasksInfo();
    testPart2();
    testPart3();
    testPart4Sync();
    await testPart4Async();

    const summary = `Пройдено: ${passedTests}, провалено: ${failedTests}`;
    console.log('=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===');
    console.log(summary);
    if (IS_BROWSER) {
        const el = document.createElement('div');
        el.className = `test-result ${failedTests === 0 ? 'success' : 'error'}`;
        el.innerHTML = `<strong>Итого:</strong> ${summary}`;
        document.getElementById('testResults').prepend(el);
    } else {
        process.exitCode = failedTests === 0 ? 0 : 1;
    }
}

if (IS_BROWSER) {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}
