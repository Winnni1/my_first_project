// Тесты для algorithms.js.
// Работают и в браузере (index.html), и в Node.js: node tests.js

// В Node.js подключаем функции из algorithms.js
if (typeof module !== 'undefined' && module.exports && typeof isPrime === 'undefined') {
    Object.assign(globalThis, require('./algorithms.js'));
}

let failedTests = 0;

// Функция для вывода результатов тестов
function runTest(testName, actual, expected) {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
    if (!isEqual) failedTests++;

    const status = isEqual ? '✅ УСПЕХ' : '❌ ОШИБКА';

    if (typeof document !== 'undefined') {
        const resultElement = document.createElement('div');
        resultElement.className = `test-result ${isEqual ? 'success' : 'error'}`;
        resultElement.innerHTML = `
            <strong>${testName}:</strong>
            ${status}
            <br>
            Ожидалось: ${JSON.stringify(expected)}
            <br>
            Получено: ${JSON.stringify(actual)}
        `;
        document.getElementById('testResults').appendChild(resultElement);
    }

    console.log(`${testName}:`, status, { expected, actual });
}

// Запуск всех тестов
function runAllTests() {
    console.log('=== ЗАПУСК ТЕСТОВ ===');

    // Тесты для работы с числами
    runTest('isPrime(7)', isPrime(7), true);
    runTest('isPrime(10)', isPrime(10), false);
    runTest('factorial(5)', factorial(5), 120);
    runTest('gcd(54, 24)', gcd(54, 24), 6);
    runTest('fibonacci(6)', fibonacci(6), [0, 1, 1, 2, 3, 5]);

    // Тесты для работы со строками
    runTest('isPalindrome("А роза упала на лапу Азора")', isPalindrome("А роза упала на лапу Азора"), true);
    runTest('countVowels("JavaScript")', countVowels("JavaScript"), 3);
    runTest('reverseString("hello")', reverseString("hello"), "olleh");
    runTest('findLongestWord("Самое длинное слово в предложении")', findLongestWord("Самое длинное слово в предложении"), "предложении");

    // Тесты для работы с массивами
    runTest('findMax([3, 7, 2, 9, 1])', findMax([3, 7, 2, 9, 1]), 9);
    runTest('removeDuplicates([1, 2, 2, 3, 4, 4, 5])', removeDuplicates([1, 2, 2, 3, 4, 4, 5]), [1, 2, 3, 4, 5]);
    runTest('bubbleSort([64, 34, 25, 12, 22, 11, 90])', bubbleSort([64, 34, 25, 12, 22, 11, 90]), [11, 12, 22, 25, 34, 64, 90]);
    runTest('binarySearch([1, 3, 5, 7, 9], 5)', binarySearch([1, 3, 5, 7, 9], 5), 2);

    // Тесты для утилитарных функций
    runTest('formatCurrency(1234.56)', formatCurrency(1234.56), "1 234.56 ₽");
    runTest('isValidEmail("test@example.com")', isValidEmail("test@example.com"), true);

    // Дополнительные тесты: крайние случаи (edge cases)
    runTest('isPrime(1)', isPrime(1), false);
    runTest('isPrime(2)', isPrime(2), true);
    runTest('isPrime(97)', isPrime(97), true);
    runTest('factorial(0)', factorial(0), 1);
    runTest('fibonacci(0)', fibonacci(0), []);
    runTest('fibonacci(1)', fibonacci(1), [0]);
    runTest('gcd(17, 5)', gcd(17, 5), 1);
    runTest('gcd(0, 5)', gcd(0, 5), 5);
    runTest('isPalindrome("hello")', isPalindrome("hello"), false);
    runTest('isPalindrome("")', isPalindrome(""), true);
    runTest('countVowels("Привет, мир!")', countVowels("Привет, мир!"), 3);
    runTest('reverseString("")', reverseString(""), "");
    runTest('findLongestWord("")', findLongestWord(""), "");
    runTest('findMax([])', findMax([]), undefined);
    runTest('findMax([-5, -2, -9])', findMax([-5, -2, -9]), -2);
    runTest('removeDuplicates([])', removeDuplicates([]), []);
    runTest('bubbleSort([])', bubbleSort([]), []);
    runTest('bubbleSort([3, 3, 1])', bubbleSort([3, 3, 1]), [1, 3, 3]);
    runTest('binarySearch([1, 3, 5, 7, 9], 4)', binarySearch([1, 3, 5, 7, 9], 4), -1);
    runTest('binarySearch([], 1)', binarySearch([], 1), -1);
    runTest('formatCurrency(1234567.5, "$")', formatCurrency(1234567.5, "$"), "1 234 567.50 $");
    runTest('formatCurrency(0)', formatCurrency(0), "0.00 ₽");
    runTest('isValidEmail("invalid.email")', isValidEmail("invalid.email"), false);
    runTest('isValidEmail("a@b")', isValidEmail("a@b"), false);

    // Тесты generatePassword (результат случайный — проверяем свойства)
    const pwd = generatePassword(12);
    runTest('generatePassword(12): длина', pwd.length, 12);
    runTest('generatePassword(12): состав',
        /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd), true);
    runTest('generatePassword(): длина по умолчанию', generatePassword().length, 8);

    console.log('=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===');
    console.log(failedTests === 0 ? 'Все тесты пройдены' : `Провалено тестов: ${failedTests}`);
}

// Дополнительные демонстрации в консоли
function demonstrateAlgorithms() {
    console.log('\n=== ДЕМОНСТРАЦИЯ АЛГОРИТМОВ ===');

    console.log('Сгенерированный пароль:', generatePassword(12));
    console.log('Числа Фибоначчи до 10:', fibonacci(10));
    console.log('Проверка email "invalid.email":', isValidEmail("invalid.email"));

    const testArray = [5, 2, 8, 1, 9];
    console.log('Исходный массив:', testArray);
    console.log('Отсортированный массив:', bubbleSort(testArray));
    console.log('Максимальный элемент:', findMax(testArray));
}

// Запуск при загрузке страницы (в Node.js — сразу)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        runAllTests();
        demonstrateAlgorithms();
    });
} else {
    runAllTests();
    demonstrateAlgorithms();
    process.exitCode = failedTests === 0 ? 0 : 1;
}
