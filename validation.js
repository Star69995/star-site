// validation.js

// Function to validate the form
function validateForm(event) {
    // Prevent form submission
    event.preventDefault();

    // Get the form element
    const form = document.querySelector('form');

    // Get the input elements
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    const messageInput = form.querySelector('#message');

    const formMessage = document.querySelector('.form-message');

    // Initialize a flag for validation
    let isValid = true;

    // Check each field and show error messages if invalid

    // ניקוי הודעות שגיאה ישנות
    clearErrorMessages();

    const nameInputVal = nameInput.value.trim();
    // בדיקת השדה שם
    if (nameInputVal === '' || !nameInputVal.includes(' ')) {
        setError(nameInput, 'אנא הכנס שם מלא (שני מילים לפחות)');
        nameInput.focus();
        isValid = false;
    }

    // בדיקת השדה דוא"ל
    if (emailInput.value.trim() === '') {
        setError(emailInput, 'אנא הכנס את כתובת הדוא"ל שלך');
        emailInput.focus();
        isValid = false;
    }

    // בדיקת השדה טלפון
    if (phoneInput.value.trim() !== '' && !/^\d{10}$/.test(phoneInput.value.trim())) {
        setError(phoneInput, 'אנא הכנס מספר טלפון תקני (10 ספרות)');
        phoneInput.focus();
        isValid = false;
    }

    // בדיקת השדה הודעה
    if (messageInput.value.trim() === '') {
        setError(messageInput, 'אנא הכנס הודעה');
        messageInput.focus();
        isValid = false;
    }

    // אם הכל תקין, הצגת הודעת הצלחה
    if (isValid) {
        formMessage.classList.remove('hidden');
        formMessage.textContent = 'תודה על מילוי הפרטים. שירות זה יהיה זמין בקרוב.';
        form.reset();
    }
}

// פונקציה להצגת הודעת שגיאה
function setError(inputElement, message) {
    const errorMessageElement = document.createElement('div');
    errorMessageElement.classList.add('error-message');
    errorMessageElement.textContent = message;

    // הוסף את אלמנט השגיאה מתחת לשדה הקלט
    inputElement.parentElement.appendChild(errorMessageElement);
}

// פונקציה לניקוי הודעות שגיאה קיימות
function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.remove());
}
