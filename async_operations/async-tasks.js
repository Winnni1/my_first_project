function displayOutput(elementId, data, isError = false) {
  const output = document.getElementById(elementId);
  if (!output) return;
  const timestamp = new Date().toLocaleTimeString();
  const content = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
  output.textContent = `[${timestamp}] ${content}`;
  output.className = `output ${isError ? "error" : "success"}`;
}

function updateProgress(percentage) {
  const fill = document.getElementById("progress-fill");
  if (fill) fill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
}

function setLoadingState(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span>Загрузка...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
    delete button.dataset.originalText;
  }
}

//основы промисов
function createBasicPromise(shouldResolve = true) {
  return new Promise((resolve, reject) => {
    setTimeout(() => shouldResolve ? resolve("Успех!") : reject(new Error("Ошибка!")), 1000);
  });
}

function handleBasicPromise() {
  displayOutput("promise-output", "Ожидание результата промиса...");
  return createBasicPromise(true)
    .then(result => displayOutput("promise-output", result))
    .catch(error => displayOutput("promise-output", error.message, true));
}

function createPromiseChain() {
  displayOutput("promise-output", "Запущена цепочка из 3 промисов...");
  return Promise.resolve("Старт")
    .then(value => new Promise(resolve => setTimeout(() => resolve(`${value} → шаг 1`), 500)))
    .then(value => new Promise(resolve => setTimeout(() => resolve(`${value} → шаг 2`), 500)))
    .then(value => new Promise(resolve => setTimeout(() => resolve(`${value} → шаг 3`), 500)))
    .then(result => displayOutput("promise-output", result))
    .catch(error => displayOutput("promise-output", error.message, true));
}

function handlePromiseError() {
  displayOutput("promise-output", "Ожидание ошибки...");
  return createBasicPromise(false)
    .then(result => displayOutput("promise-output", result))
    .catch(error => displayOutput("promise-output", `Ошибка обработана: ${error.message}`, true));
}

function setupPromiseEvents() {
  document.getElementById("basic-promise")?.addEventListener("click", handleBasicPromise);
  document.getElementById("promise-chain")?.addEventListener("click", createPromiseChain);
  document.getElementById("promise-error")?.addEventListener("click", handlePromiseError);
}

// Async/Await
async function basicAsyncAwait() {
  displayOutput("async-output", "Запрос выполняется...");
  await delayWithPromise(300);
  try {
    const result = await createBasicPromise(true);
    displayOutput("async-output", `Результат: ${result}`);
    return result;
  } catch (error) {
    displayOutput("async-output", error.message, true);
  }
}

async function handleAsyncError() {
  try {
    const result = await createBasicPromise(false);
    displayOutput("async-output", result);
  } catch (error) {
    displayOutput("async-output", `try/catch поймал: ${error.message}`, true);
    return error;
  }
}

async function parallelAsyncExecution() {
  displayOutput("async-output", "3 операции запущены параллельно...");
  const start = performance.now();
  const results = await Promise.all([
    delayWithPromise(1000).then(() => "Операция 1 готова"),
    delayWithPromise(700).then(() => "Операция 2 готова"),
    delayWithPromise(500).then(() => "Операция 3 готова")
  ]);
  const elapsed = Math.round(performance.now() - start);
  displayOutput("async-output", `${results.join("\n")}\nОбщее время: ${elapsed} мс`);
  return { results, elapsed };
}

function setupAsyncEvents() {
  document.getElementById("basic-async")?.addEventListener("click", basicAsyncAwait);
  document.getElementById("async-error")?.addEventListener("click", handleAsyncError);
  document.getElementById("async-parallel")?.addEventListener("click", parallelAsyncExecution);
}

// API
async function fetchUsers() {
  const dataBox = document.getElementById("api-data");
  setLoadingState("fetch-users", true);
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const users = await response.json();
    if (dataBox) {
      dataBox.innerHTML = users.map(user => `
        <article class="user-card">
          <h3>${escapeHTML(user.name)}</h3>
          <p><strong>Логин:</strong> ${escapeHTML(user.username)}</p>
          <p><strong>Email:</strong> ${escapeHTML(user.email)}</p>
          <p><strong>Компания:</strong> ${escapeHTML(user.company?.name || "—")}</p>
        </article>`).join("");
    }
    displayOutput("api-output", `Получено пользователей: ${users.length}`);
    return users;
  } catch (error) {
    displayOutput("api-output", `Не удалось загрузить пользователей: ${error.message}`, true);
    if (dataBox) dataBox.textContent = "Ошибка загрузки данных.";
    throw error;
  } finally {
    setLoadingState("fetch-users", false);
  }
}

async function createPost() {
  setLoadingState("fetch-post", true);
  const post = { title: "Пост из практической работы №13", body: "Демонстрация POST-запроса с fetch.", userId: 1 };
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(post)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const result = await response.json();
    displayOutput("api-output", `POST успешно выполнен:\n${JSON.stringify(result, null, 2)}`);
    return result;
  } catch (error) {
    displayOutput("api-output", `Ошибка POST-запроса: ${error.message}`, true);
    throw error;
  } finally {
    setLoadingState("fetch-post", false);
  }
}

async function testApiError() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/invalid-endpoint-pr13");
    if (!response.ok) {
      displayOutput("api-output", `HTTP-ошибка: ${response.status} ${response.statusText}`, true);
      return { status: response.status, ok: false };
    }
    await response.json();
  } catch (error) {
    displayOutput("api-output", `Сетевая ошибка: ${error.message}`, true);
    return { networkError: error.message };
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function setupApiEvents() {
  document.getElementById("fetch-users")?.addEventListener("click", () => fetchUsers().catch(() => {}));
  document.getElementById("fetch-post")?.addEventListener("click", () => createPost().catch(() => {}));
  document.getElementById("fetch-error")?.addEventListener("click", testApiError);
}

// таймеры
let intervalId = null;
let intervalCounter = 0;

async function startAsyncInterval() {
  if (intervalId !== null) return;
  intervalCounter = 0;
  displayOutput("interval-output", "Интервал запущен: 0");
  intervalId = setInterval(async () => {
    await delayWithPromise(50);
    intervalCounter += 1;
    displayOutput("interval-output", `Интервал: ${intervalCounter}`);
  }, 1000);
}

function stopAsyncInterval() {
  if (intervalId !== null) clearInterval(intervalId);
  intervalId = null;
  intervalCounter = 0;
  displayOutput("interval-output", "Интервал остановлен и счетчик сброшен: 0");
}

function delayWithPromise(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
}

async function testDelay() {
  displayOutput("timer-output", "Начало последовательных задержек...");
  for (const seconds of [1, 2, 3]) {
    await delayWithPromise(500);
    displayOutput("timer-output", `Шаг ${seconds} из 3 выполнен`);
  }
  displayOutput("timer-output", "Все задержки завершены!");
}

function setupTimerEvents() {
  document.getElementById("start-interval")?.addEventListener("click", startAsyncInterval);
  document.getElementById("stop-interval")?.addEventListener("click", stopAsyncInterval);
  document.getElementById("delay-promise")?.addEventListener("click", testDelay);
}

// обработка ошибок
async function asyncTryCatch() {
  const messages = [];
  try {
    await delayWithPromise(200);
    try {
      throw new TypeError("Некорректный тип данных (пример)");
    } catch (error) {
      if (error instanceof TypeError) messages.push(`Внутренний блок: ${error.message}`);
      else throw error;
    }
    await Promise.reject(new Error("Ошибка второй операции"));
  } catch (error) {
    messages.push(`Внешний блок: ${error.message}`);
  }
  displayOutput("error-output", messages.join("\n"), true);
  return messages;
}

async function handleMultipleErrors() {
  const operations = [
    delayWithPromise(150).then(() => "Операция A выполнена"),
    delayWithPromise(250).then(() => { throw new Error("Операция B не удалась"); }),
    delayWithPromise(100).then(() => "Операция C выполнена"),
    Promise.reject(new TypeError("Операция D: неверный тип"))
  ];
  const results = await Promise.allSettled(operations);
  const fulfilled = results.filter(item => item.status === "fulfilled").length;
  const rejected = results.filter(item => item.status === "rejected").length;
  const report = results.map((item, i) => item.status === "fulfilled"
    ? `${i + 1}. Успех: ${item.value}`
    : `${i + 1}. Ошибка: ${item.reason.message}`).join("\n");
  displayOutput("error-output", `${report}\nИтого: успешно ${fulfilled}, ошибок ${rejected}`);
  return { results, fulfilled, rejected };
}

async function retryWithBackoff(operation, maxRetries = 3) {
  if (typeof operation !== "function") throw new TypeError("operation должна быть функцией");
  if (!Number.isInteger(maxRetries) || maxRetries < 0) throw new RangeError("maxRetries должен быть целым числом >= 0");
  let attempt = 0;
  while (true) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (attempt >= maxRetries) throw error;
      const waitMs = 250 * (2 ** attempt);
      await delayWithPromise(waitMs);
      attempt += 1;
    }
  }
}

async function testRetryPattern() {
  let calls = 0;
  try {
    const result = await retryWithBackoff(async () => {
      calls += 1;
      if (calls < 3) throw new Error(`Временная ошибка, попытка ${calls}`);
      return "Операция успешно выполнена";
    }, 3);
    displayOutput("error-output", `${result}\nКоличество попыток: ${calls}`);
    return result;
  } catch (error) {
    displayOutput("error-output", `Повторные попытки исчерпаны: ${error.message}`, true);
    throw error;
  }
}

function setupErrorEvents() {
  document.getElementById("try-catch")?.addEventListener("click", asyncTryCatch);
  document.getElementById("multiple-errors")?.addEventListener("click", handleMultipleErrors);
  document.getElementById("retry-pattern")?.addEventListener("click", () => testRetryPattern().catch(() => {}));
}

// параллельные операции
async function demonstratePromiseAll() {
  const start = performance.now();
  const tasks = [500, 800, 300, 1000, 600].map((ms, i) =>
    delayWithPromise(ms).then(() => `Задача ${i + 1} (${ms} мс)`)
  );
  const results = await Promise.all(tasks);
  const elapsed = Math.round(performance.now() - start);
  displayOutput("parallel-output", `${results.join("\n")}\nPromise.all: завершено за ${elapsed} мс`);
  return { results, elapsed };
}

async function demonstratePromiseRace() {
  const start = performance.now();
  const result = await Promise.race([
    delayWithPromise(700).then(() => "Первый: 700 мс"),
    delayWithPromise(300).then(() => "Второй: 300 мс"),
    delayWithPromise(500).then(() => "Третий: 500 мс")
  ]);
  const elapsed = Math.round(performance.now() - start);
  displayOutput("parallel-output", `Promise.race вернул: ${result}\nВремя: ${elapsed} мс (остальные операции продолжаются)`);
  return result;
}

async function demonstratePromiseAllSettled() {
  const results = await Promise.allSettled([
    delayWithPromise(200).then(() => "Первая операция успешна"),
    delayWithPromise(300).then(() => { throw new Error("Вторая операция завершилась ошибкой"); }),
    delayWithPromise(100).then(() => "Третья операция успешна"),
    Promise.reject(new Error("Четвертая операция отклонена"))
  ]);
  const report = results.map((item, i) => item.status === "fulfilled"
    ? `${i + 1}: fulfilled — ${item.value}`
    : `${i + 1}: rejected — ${item.reason.message}`).join("\n");
  displayOutput("parallel-output", report);
  return results;
}

function setupParallelEvents() {
  document.getElementById("promise-all")?.addEventListener("click", demonstratePromiseAll);
  document.getElementById("promise-race")?.addEventListener("click", demonstratePromiseRace);
  document.getElementById("promise-allSettled")?.addEventListener("click", demonstratePromiseAllSettled);
}

// Задание 7: сценарии
async function sequentialApiRequests() {
  displayOutput("scenario-output", "Выполняются последовательные запросы...");
  try {
    const userResponse = await fetch("https://jsonplaceholder.typicode.com/users/1");
    if (!userResponse.ok) throw new Error(`Пользователь: HTTP ${userResponse.status}`);
    const user = await userResponse.json();

    const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`);
    if (!postsResponse.ok) throw new Error(`Посты: HTTP ${postsResponse.status}`);
    const posts = await postsResponse.json();

    if (!posts.length) throw new Error("У пользователя нет постов");
    const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${posts[0].id}/comments`);
    if (!commentsResponse.ok) throw new Error(`Комментарии: HTTP ${commentsResponse.status}`);
    const comments = await commentsResponse.json();

    const result = { user, posts, firstPostComments: comments };
    displayOutput("scenario-output", `Пользователь: ${user.name}\nПостов: ${posts.length}\nКомментарии к первому посту: ${comments.length}\n\n${JSON.stringify(result, null, 2)}`);
    return result;
  } catch (error) {
    displayOutput("scenario-output", `Ошибка последовательного запроса: ${error.message}`, true);
    throw error;
  }
}

async function simulateFileUpload() {
  const buttonId = "upload-simulation";
  setLoadingState(buttonId, true);
  updateProgress(0);
  try {
    await new Promise((resolve, reject) => {
      let progress = 0;
      const timer = setInterval(() => {
        progress += 10;
        updateProgress(progress);
        displayOutput("scenario-output", `Симуляция загрузки: ${progress}%`);
        if (progress >= 100) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
      if (progress > 100) reject(new Error("Прогресс превысил допустимое значение"));
    });
    displayOutput("scenario-output", "Загрузка завершена успешно!");
    return true;
  } finally {
    setLoadingState(buttonId, false);
  }
}

function createRequestCache() {
  const cache = new Map();
  return async function cachedRequest(url) {
    if (cache.has(url)) {
      displayOutput("scenario-output", `Кэш: возвращаем сохраненный ответ для ${url}`);
      return cache.get(url);
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} для ${url}`);
    const data = await response.json();
    cache.set(url, data);
    displayOutput("scenario-output", `Кэш: данные сохранены для ${url}`);
    return data;
  };
}

async function testRequestCache() {
  const cachedRequest = createRequestCache();
  const url = "https://jsonplaceholder.typicode.com/posts/1";
  const first = await cachedRequest(url);
  const second = await cachedRequest(url);
  displayOutput("scenario-output", `Первый запрос и повтор из кэша совпадают: ${JSON.stringify(first) === JSON.stringify(second)}\n${JSON.stringify(second, null, 2)}`);
  return { first, second };
}

function setupRealScenarioEvents() {
  document.getElementById("sequential-requests")?.addEventListener("click", () => sequentialApiRequests().catch(() => {}));
  document.getElementById("upload-simulation")?.addEventListener("click", simulateFileUpload);
  document.getElementById("cache-requests")?.addEventListener("click", () => testRequestCache().catch(error => displayOutput("scenario-output", error.message, true)));
}

function initializeAsyncOperations() {
  setupPromiseEvents();
  setupAsyncEvents();
  setupApiEvents();
  setupTimerEvents();
  setupErrorEvents();
  setupParallelEvents();
  setupRealScenarioEvents();
  console.log("Все асинхронные обработчики инициализированы.");
}
document.addEventListener("DOMContentLoaded", initializeAsyncOperations);
