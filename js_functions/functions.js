/**
 * Практическая работа №10: JavaScript — работа с функциями.
 */

// ======================= Часть 2: Основные задания =======================

// Сумма любого количества аргументов (rest parameters).
// sum() === 0. Нечисловые аргументы вызывают TypeError.
function sum(...numbers) {
    let total = 0;
    for (const num of numbers) {
        if (typeof num !== 'number' || Number.isNaN(num)) {
            throw new TypeError(`sum: аргумент "${String(num)}" не является числом`);
        }
        total += num;
    }
    return total;
}

// Создание пользователя с деструктуризацией; email необязателен.
// Значение по умолчанию подставляется и для undefined, но не для null.
function createUser({ name, age, email = 'не указан' } = {}) {
    return `Пользователь: ${name}, возраст: ${age}, email: ${email}`;
}

// Замыкание: message и password недоступны снаружи, только через возвращённую функцию.
function secretMessage(password, message) {
    return function (attempt) {
        return attempt === password ? message : 'Доступ запрещен';
    };
}

// ================= Часть 3: Рекурсия и функции высшего порядка =================

// Композиция справа налево: compose(f, g, h)(x) === f(g(h(x))).
// Без аргументов возвращает тождественную функцию.
function compose(...functions) {
    return function (...args) {
        if (functions.length === 0) return args[0];
        let result = functions[functions.length - 1].apply(this, args);
        for (let i = functions.length - 2; i >= 0; i--) {
            result = functions[i].call(this, result);
        }
        return result;
    };
}

// Бонус: pipe — то же, но слева направо: pipe(f, g, h)(x) === h(g(f(x))).
function pipe(...functions) {
    return compose(...functions.slice().reverse());
}

// Аналог Array.prototype.map (callback получает элемент, индекс, массив).
// Пропуски в разреженных массивах сохраняются.
function myMap(array, callback) {
    assertArrayAndCallback(array, callback);
    const result = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
        if (i in array) result[i] = callback(array[i], i, array);
    }
    return result;
}

// Аналог Array.prototype.filter
function myFilter(array, callback) {
    assertArrayAndCallback(array, callback);
    const result = [];
    for (let i = 0; i < array.length; i++) {
        if (i in array && callback(array[i], i, array)) result.push(array[i]);
    }
    return result;
}

// Аналог Array.prototype.reduce.
// Без initialValue берётся первый элемент; для пустого массива без initialValue — TypeError.
function myReduce(array, callback, initialValue) {
    assertArrayAndCallback(array, callback);
    let i = 0;
    let accumulator;

    if (arguments.length >= 3) {
        accumulator = initialValue;
    } else {
        while (i < array.length && !(i in array)) i++;
        if (i >= array.length) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        accumulator = array[i++];
    }

    for (; i < array.length; i++) {
        if (i in array) accumulator = callback(accumulator, array[i], i, array);
    }
    return accumulator;
}

// Вспомогательная проверка аргументов для myMap/myFilter/myReduce
function assertArrayAndCallback(array, callback) {
    if (!Array.isArray(array)) throw new TypeError('Первый аргумент должен быть массивом');
    if (typeof callback !== 'function') throw new TypeError('callback должен быть функцией');
}

// ======================= Часть 4: Сложно, но важно =======================

// Каррирование: curry(f)(1)(2)(3), curry(f)(1, 2)(3) и curry(f)(1, 2, 3) дают один результат.
// Число аргументов определяется по fn.length.
function curry(fn) {
    if (typeof fn !== 'function') throw new TypeError('curry ожидает функцию');
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function (...nextArgs) {
            return curried.apply(this, [...args, ...nextArgs]);
        };
    };
}

// Мемоизация: результат кэшируется по набору аргументов.
// Ключ — JSON-представление аргументов; кэш хранится в замыкании.
// Кэшируются и результаты undefined/null (проверка через Map.has).
function memoize(fn) {
    if (typeof fn !== 'function') throw new TypeError('memoize ожидает функцию');
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Дебаунсинг: fn вызывается только после паузы в delay мс с момента последнего вызова.
// Возвращаемая функция имеет метод cancel() для отмены отложенного вызова.
function debounce(fn, delay) {
    let timerId = null;

    function debounced(...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            timerId = null;
            fn.apply(this, args);
        }, delay);
    }

    debounced.cancel = () => {
        clearTimeout(timerId);
        timerId = null;
    };
    return debounced;
}

// Троттлинг: fn вызывается не чаще одного раза в interval мс.
// Первый вызов выполняется сразу, а последний «пропущенный» — в конце интервала (trailing).
function throttle(fn, interval) {
    let lastCallTime = 0;
    let timerId = null;
    let pendingArgs = null;
    let pendingThis = null;

    function throttled(...args) {
        const now = Date.now();
        const remaining = interval - (now - lastCallTime);

        if (remaining <= 0) {
            clearTimeout(timerId);
            timerId = null;
            pendingArgs = null;
            lastCallTime = now;
            fn.apply(this, args);
        } else {
            // Запоминаем последние аргументы и вызываем их по окончании интервала
            pendingArgs = args;
            pendingThis = this;
            if (timerId === null) {
                timerId = setTimeout(() => {
                    timerId = null;
                    lastCallTime = Date.now();
                    const callArgs = pendingArgs;
                    pendingArgs = null;
                    if (callArgs) fn.apply(pendingThis, callArgs);
                }, remaining);
            }
        }
    }

    throttled.cancel = () => {
        clearTimeout(timerId);
        timerId = null;
        pendingArgs = null;
    };
    return throttled;
}

// Валидатор пароля/строки.
// options: { minLength = 0, requireDigit = false, requireUppercase = false }
// Возвращает функцию (value) => { valid: boolean, errors: string[] }
function createValidator(options = {}) {
    const { minLength = 0, requireDigit = false, requireUppercase = false } = options;

    return function validate(value) {
        const errors = [];

        if (typeof value !== 'string') {
            return { valid: false, errors: ['Значение должно быть строкой'] };
        }
        if (value.length < minLength) {
            errors.push(`Минимальная длина: ${minLength}`);
        }
        if (requireDigit && !/\d/.test(value)) {
            errors.push('Должна быть хотя бы одна цифра');
        }
        if (requireUppercase && !/[A-ZА-ЯЁ]/.test(value)) {
            errors.push('Должна быть хотя бы одна заглавная буква');
        }
        return { valid: errors.length === 0, errors };
    };
}

// Экспорт для запуска тестов в Node.js (в браузере не используется)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sum, createUser, secretMessage,
        compose, pipe, myMap, myFilter, myReduce,
        curry, memoize, debounce, throttle, createValidator
    };
}
