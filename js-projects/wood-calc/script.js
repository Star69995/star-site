// אסוף את כל האלמנטים בשימוש
const elements = {
    numPieces: document.getElementById('num-pieces'),
    sizeInputs: document.querySelectorAll('.size-input'),
    rangeLow: document.getElementById('range-low'),
    rangeHigh: document.getElementById('range-high'),
    output: document.getElementById('output'),
    calculateBtn: document.getElementById('calculate-btn'),
    clearBtn: document.getElementById('clear-btn'),
    toggleInstructionsBtn: document.getElementById('toggle-instructions'),
    fullInstructions: document.getElementById('full-instructions'),
};

// אסוף את תיבות הקלט ותיבות הסימון
elements.sizeInputs = document.querySelectorAll('.size-input');
elements.excludeCheckboxes = document.querySelectorAll('.exclude-checkbox');

// חיבור אירועים לתיבות הסימון
elements.excludeCheckboxes.forEach((checkbox, index) => {
    checkbox.addEventListener('change', () => {
        const relatedInput = elements.sizeInputs[index];
        // נטרול תיבת הקלט אם תיבת הסימון אינה מסומנת
        if (checkbox.checked) {
            relatedInput.disabled = false;
        } else {
            relatedInput.disabled = true;
        }
    });
});



// חישוב קומבינציות
elements.calculateBtn.addEventListener('click', () => {
    // בדיקת תקינות השדות
    let isValid = true;
    let outputMessage = '';

    // בדיקת "מספר חתיכות"
    if (!elements.numPieces.checkValidity()) {
        isValid = false;
        outputMessage += 'מספר החתיכות אינו תקין: ' + elements.numPieces.validationMessage + '\n';
        elements.numPieces.focus();
    }

    // בדיקת טווח מינימלי
    else if (!elements.rangeLow.checkValidity()) {
        isValid = false;
        outputMessage += 'טווח מינימלי אינו תקין: ' + elements.rangeLow.validationMessage + '\n';
        elements.rangeLow.focus();
    }

    // בדיקת טווח מקסימלי
    else if (!elements.rangeHigh.checkValidity()) {
        isValid = false;
        outputMessage += 'טווח מקסימלי אינו תקין: ' + elements.rangeHigh.validationMessage + '\n';
        elements.rangeHigh.focus();
    }

    // בדיקת כל שדות הגודל
    else {
        for (let i = 0; i < elements.sizeInputs.length; i++) {
            const sizeInput = elements.sizeInputs[i];
            if (!sizeInput.checkValidity()) {
                isValid = false;
                outputMessage += `גודל ${i + 1} אינו תקין: ` + sizeInput.validationMessage + '\n';
                sizeInput.focus();
                break;
            }
        }
    }

    // אם השדות אינם תקינים
    if (!isValid) {
        elements.output.textContent = outputMessage;
        return;
    }

    // אם כל השדות תקינים, מבצע את החישוב
    const numPieces = parseInt(elements.numPieces.value);
    // איסוף גדלים תוך התעלמות מתיבות קלט שסומנו כ"לא לכלול"
    const sizes = Array.from(elements.sizeInputs)
        .map((input, index) => elements.excludeCheckboxes[index].checked ? parseFloat(input.value) : null)
        .filter(size => size !== null);

    const rangeLow = parseFloat(elements.rangeLow.value);
    const rangeHigh = parseFloat(elements.rangeHigh.value);
    elements.output.textContent = ''; // נקה את הפלט הקודם

    // הקוד הקיים של חישוב קומבינציות...
    let isCombination = false;

    for (let i = 1; i <= numPieces; i++) {
        const combinations = getCombinations(sizes, i);
        const filteredCombinations = filterCombinations(combinations, rangeLow, rangeHigh);
        const uniqueCombinations = getUniqueCombinations(filteredCombinations);

        if (uniqueCombinations.length > 0) {
            const numPiecesHeader = document.createElement('div');
            numPiecesHeader.classList.add('num-pieces-header');
            numPiecesHeader.textContent = `${i} חתיכות:`;
            elements.output.appendChild(numPiecesHeader);

            uniqueCombinations.forEach((combination, index) => {
                if (combination.includes(0)) return; // Skip combinations with 0
                isCombination = true;

                const combinationDiv = document.createElement('div');
                combinationDiv.classList.add('combination');

                const header = document.createElement('div');
                header.classList.add('combination-header');
                header.textContent = `קומבינציה ${index + 1} (אורך כולל: ${combination.reduce((a, b) => a + b, 0).toFixed(1)})`;
                combinationDiv.appendChild(header);

                const piecesDiv = document.createElement('div');
                piecesDiv.classList.add('combination-pieces');
                const counts = countPieces(combination);
                Object.keys(counts).forEach(size => {
                    const pieceDetail = document.createElement('div');
                    pieceDetail.textContent = `${size} x ${counts[size]}`;
                    pieceDetail.classList.add('piece-detail');
                    piecesDiv.appendChild(pieceDetail);
                });
                combinationDiv.appendChild(piecesDiv);
                elements.output.appendChild(combinationDiv);
            });
        }
    }

    if (!isCombination) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error-message');
        errorDiv.textContent = "לא נמצאו קומבינציות.";
        elements.output.appendChild(errorDiv);
    }
});

function getCombinations(arr, len) {
    let result = [];
    function generate(curr, index) {
        if (curr.length === len) {
            result.push(curr);
            return;
        }
        for (let i = index; i < arr.length; i++) {
            generate([...curr, arr[i]], i);
        }
    }
    generate([], 0);
    return result;
}

function filterCombinations(combinations, rangeLow, rangeHigh) {
    return combinations.filter(combination => {
        const total = combination.reduce((a, b) => a + b, 0);
        return total >= rangeLow && total <= rangeHigh;
    });
}

function getUniqueCombinations(combinations) {
    const uniqueSet = new Set(combinations.map(c => JSON.stringify(c)));
    return Array.from(uniqueSet).map(c => JSON.parse(c));
}

function countPieces(combination) {
    return combination.reduce((acc, size) => {
        acc[size] = (acc[size] || 0) + 1;
        return acc;
    }, {});
}



// ניקוי הפלט
elements.clearBtn.addEventListener('click', () => {
    elements.output.textContent = '';
});

// הצגת/הסתרת הסבר
elements.toggleInstructionsBtn.addEventListener('click', () => {
    if (elements.fullInstructions.style.display === "none" || elements.fullInstructions.style.display === "") {
        elements.fullInstructions.style.display = "block";
        elements.toggleInstructionsBtn.textContent = "הסתרת הסבר";
    } else {
        elements.fullInstructions.style.display = "none";
        elements.toggleInstructionsBtn.textContent = "הסבר על הכלי";
    }
});






// ולידציה לשדה "מספר החתיכות"
elements.numPieces.addEventListener('input', () => {
    const numPieces = parseInt(elements.numPieces.value);

    if (!Number.isInteger(numPieces) || numPieces <= 0) {
        elements.numPieces.setCustomValidity('יש להזין מספר שלם וחיובי.');
    } else {
        elements.numPieces.setCustomValidity('');
    }
    elements.numPieces.reportValidity(); // מציג את הודעת השגיאה
});

// ולידציה לשדות הגדלים
elements.sizeInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        const size = parseFloat(input.value);

        if (isNaN(size) || size <= 0) {
            input.setCustomValidity(`גודל הקורה  חייב להיות חיובי.`);
        } else {
            input.setCustomValidity('');
        }
        input.reportValidity();
    });
});

// ולידציה לטווחים
elements.rangeLow.addEventListener('input', validateRange);
elements.rangeHigh.addEventListener('input', validateRange);

function validateRange() {
    const rangeLow = parseFloat(elements.rangeLow.value);
    const rangeHigh = parseFloat(elements.rangeHigh.value);

    if (isNaN(rangeLow)) {
        elements.rangeLow.setCustomValidity('יש להזין ערך תקין.');
    } else {
        elements.rangeLow.setCustomValidity('');
    }

    if (isNaN(rangeHigh)) {
        elements.rangeHigh.setCustomValidity('יש להזין ערך תקין.');
    } else {
        elements.rangeHigh.setCustomValidity('');
    }

    if (!isNaN(rangeLow) && !isNaN(rangeHigh) && rangeLow > rangeHigh) {
        elements.rangeLow.setCustomValidity('הערך של הטווח המינימלי לא יכול להיות גדול מהטווח המקסימלי.');
        elements.rangeHigh.setCustomValidity('הערך של הטווח המקסימלי לא יכול להיות קטן מהטווח המינימלי.');
    } else {
        elements.rangeLow.setCustomValidity('');
        elements.rangeHigh.setCustomValidity('');
    }

    elements.rangeLow.reportValidity();
    elements.rangeHigh.reportValidity();
}



