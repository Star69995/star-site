const num1ele = document.getElementById("num1");
const num2ele = document.getElementById("num2");
const opEle = document.getElementById("op");
const check = document.getElementById("check");
const next = document.getElementById("next");
const reset = document.getElementById("reset");
const sum = document.getElementById("sum");
const message = document.getElementById('message');
const attemptsDiv = document.getElementById('attempts');
const scoreEle = document.getElementById('score');
const streakEle = document.getElementById('streak');
const difficultySelect = document.getElementById('difficulty');
const operationBtns = document.querySelectorAll('.operation-btn');
const failedEle = document.getElementById('failed');
let failedExercises = parseInt(localStorage.getItem('mathGameFailed')) || 0;


let num1, num2;
let currentOp = '+';
let attempts = 3;
let autoNextTimeout = null;

// Load scores from localStorage
let score = parseInt(localStorage.getItem('mathGameScore')) || 0;
let streak = parseInt(localStorage.getItem('mathGameStreak')) || 0;

// Update display with saved scores
scoreEle.textContent = score;
streakEle.textContent = streak;
failedEle.textContent = failedExercises;

function saveScores() {
    localStorage.setItem('mathGameScore', score.toString());
    localStorage.setItem('mathGameStreak', streak.toString());
    localStorage.setItem('mathGameFailed', failedExercises.toString());
}

function resetScores() {
    score = 0;
    streak = 0;
    failedExercises = 0;
    scoreEle.textContent = score;
    streakEle.textContent = streak;
    failedEle.textContent = failedExercises;
    saveScores();
    setEx();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateAttemptsDisplay() {
    attemptsDiv.textContent = `נשארו ${attempts} ניסיונות`;
    attemptsDiv.style.color = attempts === 1 ? '#ff4757' : '#4a154b';
}

function setEx() {
    if (autoNextTimeout) {
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
    }

    message.textContent = '';
    message.classList.remove('correct', 'incorrect');
    sum.value = '';
    attempts = 3;
    updateAttemptsDisplay();

    const range = getDifficultyRange();

    switch (currentOp) {
        case '+':
        case '-':
            num1 = getRandomInt(range.min, range.max);
            num2 = getRandomInt(range.min, range.max);
            if (currentOp === '-' && num2 > num1) {
                [num1, num2] = [num2, num1];
            }
            break;
        case '×':
            num1 = getRandomInt(range.min, Math.floor(range.max / 2));
            num2 = getRandomInt(range.min, Math.floor(range.max / 2));
            break;
        case '÷':
            num2 = getRandomInt(1, Math.floor(range.max / 4));
            num1 = num2 * getRandomInt(1, Math.floor(range.max / 4));
            break;
    }

    num1ele.textContent = num1;
    num2ele.textContent = num2;
    opEle.textContent = currentOp;
    sum.focus();
}

function getDifficultyRange() {
    switch (difficultySelect.value) {
        case 'easy':
            return { min: 1, max: 10 };
        case 'medium':
            return { min: 1, max: 20 };
        case 'hard':
            return { min: 1, max: 50 };
        default:
            return { min: 1, max: 10 };
    }
}

function calculateResult() {
    switch (currentOp) {
        case '+': return num1 + num2;
        case '-': return num1 - num2;
        case '×': return num1 * num2;
        case '÷': return num1 / num2;
        default: return 0;
    }
}

function getDifficultyMultiplier() {
    switch (difficultySelect.value) {
        case 'easy': return 1;  // Lowest multiplier
        case 'medium': return 2; // Medium multiplier
        case 'hard': return 3;  // Highest multiplier
        default: return 1;  // Fallback
    }
}

function updateScore(correct) {
    const difficultyMultiplier = getDifficultyMultiplier(); // Get multiplier based on difficulty

    if (correct) {
        score +=  (streak + 1) * difficultyMultiplier;
        streak++;
        scoreEle.classList.add('score-animation');
        setTimeout(() => scoreEle.classList.remove('score-animation'), 500);
    } else {
        if (attempts === 1) {
            streak = 0;
        }
    }
    scoreEle.textContent = score;
    streakEle.textContent = streak;
    saveScores();
}

function scheduleNextExercise() {
    autoNextTimeout = setTimeout(() => {
        if (!autoNextTimeout) return; // Check if cancelled
        setEx();
    }, 3000);
}

check.addEventListener('click', function () {
    const result = calculateResult();
    const userAns = parseFloat(sum.value);

    if (Math.abs(result - userAns) < 0.1) {
        message.textContent = 'נכון!';
        message.classList.add('correct');
        message.classList.remove('incorrect');
        updateScore(true);
        scheduleNextExercise();
    } else {
        attempts--;
        updateAttemptsDisplay();

        if (attempts > 0) {
            message.textContent = 'לא נכון, נסה שוב!';
            message.classList.add('incorrect');
            message.classList.remove('correct');
        } else {
            message.textContent = `לא נכון. התשובה הנכונה היא ${result}`;
            message.classList.add('incorrect');
            message.classList.remove('correct');
            failedExercises++;  // הוספנו רק את זה
            failedEle.textContent = failedExercises;  // ואת זה
            updateScore(false);
            saveScores();  // ואת זה
            scheduleNextExercise();
        }
    }
});

next.addEventListener('click', () => {
    if (autoNextTimeout) {
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
    }
    setEx();
});

reset.addEventListener('click', resetScores);

operationBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        operationBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentOp = e.target.dataset.op;
        setEx();
    });
});

difficultySelect.addEventListener('change', setEx);

sum.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        check.click();
    }
});


// התחלת המשחק
setEx();