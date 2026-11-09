document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registrationForm');
  const inputs = form.querySelectorAll('input, select, textarea');
  const bioTextarea = document.getElementById('bio');
  const charCount = document.getElementById('charCount');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const terms = document.getElementById('terms');

  /* Счётчик символов для textarea */
  if (bioTextarea && charCount) {
    bioTextarea.addEventListener('input', function () {
      charCount.textContent = this.value.length;
    });
  }

  /* Валидация в реальном времени */
  inputs.forEach(function (input) {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', function (e) {
      // Если поле уже с ошибкой — перепроверяем при вводе
      if (e.target.classList.contains('error')) {
        validateField(e);
      } else {
        clearErrorForField(e.target);
      }
    });
  });

  /* Проверка совпадения паролей */
  if (password && confirmPassword) {
    confirmPassword.addEventListener('input', validatePasswordMatch);
    password.addEventListener('input', function () {
      if (confirmPassword.value) validatePasswordMatch();
    });
  }

  /* Отправка формы */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let isValid = true;
    let firstInvalid = null;

    inputs.forEach(function (input) {
      if (input.name === 'confirmPassword') return; // проверяем отдельно
      if (!validateField({ target: input })) {
        isValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (password && confirmPassword && !validatePasswordMatch()) {
      isValid = false;
      if (!firstInvalid) firstInvalid = confirmPassword;
    }

    if (terms && !terms.checked) {
      showErrorForField(terms, 'Необходимо принять условия использования');
      isValid = false;
      if (!firstInvalid) firstInvalid = terms;
    } else if (terms) {
      clearErrorForField(terms);
    }

    if (isValid) {
      showSuccessMessage();
    } else {
      showErrorMessage('Пожалуйста, исправьте ошибки в форме');
      if (firstInvalid) firstInvalid.focus();
    }
  });

  /* Сброс формы */
  form.addEventListener('reset', function () {
    setTimeout(function () {
      document.querySelectorAll('.error-message').forEach(function (el) {
        el.textContent = '';
      });
      document.querySelectorAll('.error').forEach(function (el) {
        el.classList.remove('error');
      });
      if (charCount) charCount.textContent = '0';
    }, 0);
  });

  /* Функции */

  function validateField(e) {
    const field = e.target;

    // Необязательное пустое поле — валидно
    if (!field.required && !field.value.trim() && field.type !== 'checkbox') {
      clearErrorForField(field);
      return true;
    }

    // Обязательный чекбокс
    if (field.type === 'checkbox' && field.required) {
      if (!field.checked) {
        showErrorForField(field, 'Это поле обязательно для заполнения');
        return false;
      }
      clearErrorForField(field);
      return true;
    }

    if (!field.checkValidity()) {
      showErrorForField(field, getErrorMessage(field));
      return false;
    }

    clearErrorForField(field);
    return true;
  }

  function validatePasswordMatch() {
    if (!password || !confirmPassword) return true;
    const pw = password.value;
    const cpw = confirmPassword.value;

    if (!cpw) {
      clearErrorForField(confirmPassword);
      return true;
    }

    if (pw !== cpw) {
      showErrorForField(confirmPassword, 'Пароли не совпадают');
      return false;
    }

    clearErrorForField(confirmPassword);
    return true;
  }

  function getErrorMessage(field) {
    const v = field.validity;

    if (v.valueMissing) {
      return 'Это поле обязательно для заполнения';
    }
    if (v.typeMismatch) {
      if (field.type === 'email') return 'Введите корректный email адрес';
    }
    if (v.tooShort) {
      return `Минимальная длина: ${field.minLength} символов`;
    }
    if (v.tooLong) {
      return `Максимальная длина: ${field.maxLength} символов`;
    }
    if (v.rangeUnderflow) {
      return `Минимальное значение: ${field.min}`;
    }
    if (v.rangeOverflow) {
      return `Максимальное значение: ${field.max}`;
    }
    if (v.patternMismatch) {
      if (field.type === 'password') {
        return 'Пароль должен содержать заглавные и строчные буквы, цифры';
      }
      if (field.type === 'tel') {
        return 'Введите телефон в формате +7 (999) 999-99-99';
      }
    }
    if (v.badInput) {
      return 'Некорректное значение';
    }
    return 'Некорректное значение';
  }

  function showErrorForField(field, message) {
    field.classList.add('error');
    const errorElement = document.getElementById(field.id + 'Error');
    if (errorElement) {
      errorElement.textContent = message;
    }
    field.setAttribute('aria-invalid', 'true');
  }

  function clearErrorForField(field) {
    field.classList.remove('error');
    const errorElement = document.getElementById(field.id + 'Error');
    if (errorElement) {
      errorElement.textContent = '';
    }
    field.removeAttribute('aria-invalid');
  }

  function showSuccessMessage() {
    alert('Форма успешно отправлена!');
    form.reset();
    if (charCount) charCount.textContent = '0';
    document.querySelectorAll('.error-message').forEach(function (el) {
      el.textContent = '';
    });
    document.querySelectorAll('.error').forEach(function (el) {
      el.classList.remove('error');
    });
  }

  function showErrorMessage(message) {
    alert(message);
  }
});