/**
 * Практическая работа №9: JavaScript — базовые алгоритмы.
 * Для каждой функции указана временная сложность (n — размер входных данных).
 */

// ======================= Задача 2.1: Числа =======================

// Временная сложность: O(√n) - проверяем делители только до корня из n
function isPrime(number) {
    if (!Number.isInteger(number) || number < 2) return false;
    if (number === 2) return true;
    if (number % 2 === 0) return false;

    for (let i = 3; i * i <= number; i += 2) {
        if (number % i === 0) return false;
    }
    return true;
}

// Временная сложность: O(n) - линейная (n умножений)
function factorial(n) {
    if (!Number.isInteger(n) || n < 0) {
        throw new RangeError('Факториал определён для целых неотрицательных чисел');
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Временная сложность: O(n) - линейная, каждое число считается за O(1)
function fibonacci(n) {
    const result = [];
    for (let i = 0; i < n; i++) {
        result.push(i < 2 ? i : result[i - 1] + result[i - 2]);
    }
    return result;
}

// Временная сложность: O(log(min(a, b))) - логарифмическая (алгоритм Евклида)
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

// ======================= Задача 2.2: Строки =======================

// Временная сложность: O(n) - линейная (один проход двумя указателями)
function isPalindrome(str) {
    // Оставляем только буквы и цифры, приводим к нижнему регистру
    const cleaned = str.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
    let left = 0;
    let right = cleaned.length - 1;
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) return false;
        left++;
        right--;
    }
    return true;
}

// Временная сложность: O(n) - линейная
function countVowels(str) {
    const vowels = 'аеёиоуыэюяaeiou';
    let count = 0;
    for (const char of str.toLowerCase()) {
        if (vowels.includes(char)) count++;
    }
    return count;
}

// Временная сложность: O(n) - линейная (конкатенация в цикле)
function reverseString(str) {
    let result = '';
    for (let i = str.length - 1; i >= 0; i--) {
        result += str[i];
    }
    return result;
}

// Временная сложность: O(n) - линейная (один проход по строке)
function findLongestWord(sentence) {
    let longest = '';
    let current = '';
    // Добавляем пробел в конец, чтобы обработать последнее слово
    for (const char of sentence + ' ') {
        if (/[a-zа-яё0-9-]/i.test(char)) {
            current += char;
        } else {
            if (current.length > longest.length) longest = current;
            current = '';
        }
    }
    return longest;
}

// ======================= Задача 2.3: Массивы =======================

// Временная сложность: O(n) - линейная
function findMax(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

// Временная сложность: O(n) - линейная (Set даёт проверку за O(1))
function removeDuplicates(arr) {
    const seen = new Set();
    const result = [];
    for (const item of arr) {
        if (!seen.has(item)) {
            seen.add(item);
            result.push(item);
        }
    }
    return result;
}

// Временная сложность: O(n²) - квадратичная (в лучшем случае O(n) благодаря флагу swapped)
function bubbleSort(arr) {
    const result = [...arr]; // не изменяем исходный массив
    for (let i = 0; i < result.length - 1; i++) {
        let swapped = false;
        for (let j = 0; j < result.length - 1 - i; j++) {
            if (result[j] > result[j + 1]) {
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
                swapped = true;
            }
        }
        if (!swapped) break; // массив уже отсортирован
    }
    return result;
}

// Временная сложность: O(log n) - логарифмическая
function binarySearch(sortedArr, target) {
    let left = 0;
    let right = sortedArr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (sortedArr[mid] === target) return mid;
        if (sortedArr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

// ======================= Задача 2.4: Утилиты =======================

// Временная сложность: O(n) - линейная по длине записи числа
function formatCurrency(amount, currency = '₽') {
    const [intPart, fracPart] = Math.abs(amount).toFixed(2).split('.');
    // Разделяем разряды пробелами: 1234567 -> "1 234 567"
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = amount < 0 ? '-' : '';
    return `${sign}${grouped}.${fracPart} ${currency}`;
}

// Временная сложность: O(n) - линейная по длине строки
function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return pattern.test(email);
}

// Временная сложность: O(n) - линейная по длине пароля
function generatePassword(length = 8) {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%^&*()-_=+?';
    const all = lower + upper + digits + special;
    const pick = set => set[Math.floor(Math.random() * set.length)];

    // Минимум по одному символу каждого типа
    const chars = [pick(lower), pick(upper), pick(digits), pick(special)];
    while (chars.length < length) chars.push(pick(all));
    chars.length = Math.max(length, 0);

    // Перемешивание Фишера—Йетса, чтобы обязательные символы не стояли в начале
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

// Экспорт для запуска тестов в Node.js (в браузере не используется)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isPrime, factorial, fibonacci, gcd,
        isPalindrome, countVowels, reverseString, findLongestWord,
        findMax, removeDuplicates, bubbleSort, binarySearch,
        formatCurrency, isValidEmail, generatePassword
    };
}
