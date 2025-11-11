const openFormBtn = document.getElementById('openFormBtn');
const closeFormBtn = document.getElementById('closeFormBtn');
const popupOverlay = document.getElementById('popupOverlay');
const feedbackForm = document.getElementById('feedbackForm');
const responseMessage = document.getElementById('responseMessage');

// Открытие формы
openFormBtn.addEventListener('click', function() {
    popupOverlay.style.display = 'flex';
    // Изменение URL с помощью History API
    history.pushState({ formOpen: true }, '', '#feedback');
    // Восстановление данных из LocalStorage
    restoreFormData();
});

function closeForm() {
    popupOverlay.style.display = 'none';
    if (window.location.hash === '#feedback') {
        history.back();
    }
}

closeFormBtn.addEventListener('click', closeForm);
popupOverlay.addEventListener('click', function(event) {
    if (event.target === popupOverlay) {
        closeForm();
    }
});

// Обработка кнопки "Назад" браузера
window.addEventListener('popstate', function() {
    if (popupOverlay.style.display === 'flex') {
        closeForm();
    }
});

function saveFormData() {
    const formData = {
        fullname: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        message: document.getElementById('message').value,
        agreement: document.getElementById('agreement').checked
    };
    localStorage.setItem('feedbackFormData', JSON.stringify(formData));
}

function restoreFormData() {
    const savedData = localStorage.getItem('feedbackFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('fullname').value = formData.fullname || '';
        document.getElementById('email').value = formData.email || '';
        document.getElementById('phone').value = formData.phone || '';
        document.getElementById('organization').value = formData.organization || '';
        document.getElementById('message').value = formData.message || '';
        document.getElementById('agreement').checked = formData.agreement || false;
    }
}

function clearFormData() {
    localStorage.removeItem('feedbackFormData');
}

const formInputs = feedbackForm.querySelectorAll('input, textarea');
formInputs.forEach(input => {
    input.addEventListener('input', saveFormData);
});
feedbackForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(feedbackForm);
    const data = Object.fromEntries(formData);
    
    fetch('https://formcarry.com/s/YiYvo2csK9i', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            showMessage('Сообщение успешно отправлено!', 'success');
            feedbackForm.reset();
            clearFormData();
        } else {
            showMessage('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.', 'error');
    });
});

// Функция для отображения сообщений
function showMessage(text, type) {
    responseMessage.textContent = text;
    responseMessage.className = 'message ' + type;
    responseMessage.style.display = 'block';
    
    // Автоматическое скрытие сообщения через 5 секунд
    setTimeout(() => {
        responseMessage.style.display = 'none';
    }, 5000);
}

// Восстановление данных при загрузке страницы, если форма открыта
window.addEventListener('load', function() {
    if (window.location.hash === '#feedback') {
        openFormBtn.click();
    }
});