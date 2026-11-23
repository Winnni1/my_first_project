// Самостоятельные тесты
(async function runAsyncTests() {
  const tests = [];
  function test(name, fn) { tests.push({ name, fn }); }
  function assert(condition, message = "Проверка не пройдена") { if (!condition) throw new Error(message); }

  test("createBasicPromise разрешается с ожидаемым сообщением", async () => {
    assert(await createBasicPromise(true) === "Успех!");
  });
  test("createBasicPromise отклоняется с ошибкой", async () => {
    let rejected = false;
    try { await createBasicPromise(false); } catch (e) { rejected = e.message === "Ошибка!"; }
    assert(rejected);
  });
  test("delayWithPromise выполняется не раньше заданного времени", async () => {
    const start = performance.now();
    await delayWithPromise(80);
    assert(performance.now() - start >= 65, "Задержка слишком короткая");
  });
  test("retryWithBackoff возвращает успешный результат после повторов", async () => {
    let attempts = 0;
    const result = await retryWithBackoff(async () => {
      attempts++;
      if (attempts < 2) throw new Error("temporary");
      return 42;
    }, 2);
    assert(result === 42 && attempts === 2);
  });
  test("retryWithBackoff выбрасывает ошибку после лимита", async () => {
    let attempts = 0, failed = false;
    try { await retryWithBackoff(async () => { attempts++; throw new Error("fail"); }, 1); }
    catch (e) { failed = e.message === "fail"; }
    assert(failed && attempts === 2);
  });
  test("retryWithBackoff проверяет аргументы", async () => {
    let typeError = false, rangeError = false;
    try { await retryWithBackoff(null); } catch (e) { typeError = e instanceof TypeError; }
    try { await retryWithBackoff(async () => 1, -1); } catch (e) { rangeError = e instanceof RangeError; }
    assert(typeError && rangeError);
  });
  test("Promise.all возвращает все значения", async () => {
    const values = await Promise.all([delayWithPromise(10).then(() => 1), Promise.resolve(2)]);
    assert(values.length === 2 && values[0] === 1 && values[1] === 2);
  });
  test("Promise.allSettled сохраняет результаты успеха и ошибки", async () => {
    const values = await Promise.allSettled([Promise.resolve("ok"), Promise.reject(new Error("bad"))]);
    assert(values[0].status === "fulfilled" && values[1].status === "rejected");
  });
  test("Promise.race получает первый результат", async () => {
    const value = await Promise.race([delayWithPromise(30).then(() => "fast"), delayWithPromise(80).then(() => "slow")]);
    assert(value === "fast");
  });
  test("createRequestCache возвращает функцию", () => {
    assert(typeof createRequestCache() === "function");
  });
  test("escapeHTML экранирует опасные символы", () => {
    assert(escapeHTML(`<script>"'&</script>`) === "&lt;script&gt;&quot;&#39;&amp;&lt;/script&gt;");
  });

  let passed = 0;
  console.group("Тестирование ПР13 — асинхронные операции");
  for (const { name, fn } of tests) {
    try { await fn(); passed++; console.log(`✅ ${name}`); }
    catch (error) { console.error(`❌ ${name}:`, error); }
  }
  console.log(`Итог: ${passed}/${tests.length} тестов пройдено`);
  console.groupEnd();
})();
