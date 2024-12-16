class Panel {
    constructor() {
        this.addingPanel = `<div class="editing-panel">
                            <div class='buttons'> 
                                <button data-type="text">הוסף טקסט</button>
                                <button data-type="image">הוסף תמונה</button>
                                <button data-type="div">הוסף דיב</button>
                            </div>
                            <div class='clear-button-container'>
                            <button id="clear">ניקוי הדף</button>
                            </div>
                            </div>`;
        this.panel = document.createElement('div');
        this.panel.innerHTML = this.addingPanel;
        document.body.appendChild(this.panel);

        this.currentPanel = this.addingPanel;

        // General event listener for all buttons
        this.panel.addEventListener('click', (event) => {
            const { type: elementType } = event.target.dataset;
            // console.log(elementType);
            if (elementType) {
                new Element(elementType);
            }
        });
        this.showAddingPanel();

    }

    showPanel(panel = this.currentPanel) {
        this.panel.innerHTML = panel;
    }

    showAddingPanel() {
        this.showPanel(this.addingPanel);
        document.getElementById('clear').addEventListener('click', () => {
            // ניקוי האלמנטים מה-DOM
            const mainSection = document.querySelector('.main');
            mainSection.innerHTML = '';

            // ניקוי ה-localStorage
            localStorage.removeItem('elements');

            // אופציונלי: איפוס מזהה גלובלי
            globalId = 1;
            localStorage.setItem('globalId', globalId);

            // סגירת פאנל העריכה
            this.showAddingPanel();
        });

    }

    hidePanel() {
        this.panel.innerHTML = '';
    }

    showElementEditingPanel(element) {
        // יצירת פאנל עריכה דינמי
        if (element && element.propStyles) {
            let panelForm = `<div class="editing-panel element-editing-panel">`;

            // יצירת שדות קלט דינמיים עבור כל תכונה ב-propStyles
            Object.entries(element.propStyles).forEach(([key, value]) => {
                panelForm += `
            <label for="${key}">${key}:</label>
            <input type="${typeof value === 'number' ? 'number' : key.includes('color') ? 'color' : 'text'}" 
                id="${key}" value="${value}">
            <br>`;
            });

            panelForm += `
            <button id="delete-btn">מחיקת אלמנט</button>`;

            panelForm += `</div>`;
            this.showPanel(panelForm);

            // מאזינים לשדות הקלט
            Object.keys(element.propStyles).forEach((key) => {
                const inputField = document.getElementById(key);
                if (inputField) {
                    inputField.addEventListener('input', (event) => {
                        const newValue = event.target.value;

                        // עדכון ב-propStyles
                        element.propStyles[key] = newValue;

                        // עדכון בסגנון הויזואלי (style) של האלמנט
                        element.element.style[key] = newValue;  // עדכון ישיר ב-style של האלמנט
                        element.applyStyles();
                    });

                }
            });
            document.getElementById('delete-btn').addEventListener('click', () => {
                // הסרת האלמנט מה-DOM
                element.element.remove();

                // מחיקת האלמנט מה-localStorage
                let savedElements = JSON.parse(localStorage.getItem('elements')) || [];
                savedElements = savedElements.filter(el => el.id !== element.id);
                localStorage.setItem('elements', JSON.stringify(savedElements));

                // סגירת פאנל העריכה
                this.showAddingPanel();
            });


        }
    }


    showPanel(panelHTML) {
        this.panel.innerHTML = panelHTML;
    }


}

class Element {
    constructor(type, savedId, propStyles) {
        this.type = type;
        if (savedId > 0) {
            this.id = savedId;
        } else {
            this.id = globalId++;
            localStorage.globalId = globalId;
        }
        // console.log(this.id);
        if (propStyles) {
            this.propStyles = propStyles;
            this.addElement();
        } else {
            this.createNewElement();
        }


        document.addEventListener('click', (event) => {
            document.querySelectorAll('.selected').forEach(selectedEl => {
                if (!selectedEl.contains(event.target) && !panel.panel.contains(event.target)) {
                    selectedEl.classList.remove('selected');
                    panel.showAddingPanel();
                }
            });
        });

    }

    addElement() {
        switch (this.type) {
            case 'div':
                this.element = document.createElement('div');
                break;
            case 'text':
                this.element = document.createElement('p');
                break;
            case 'image':
                this.element = document.createElement('img');
                break;
        }

        this.applyStyles();
        this.element.addEventListener('click', () => this.selectElement());
        main.appendChild(this.element);
        this.saveToLocalStorage();

    }

    createNewElement() {
        switch (this.type) {
            case 'div':
                this.element = document.createElement('div');
                this.propStyles = {
                    borderRadius: '0px',
                    width: '100%',
                    backgroundColor: '#ebb0eb',
                    height: '100px',
                    borderColor: 'black',
                    borderStyle: 'solid',
                    borderWidth: '2px',
                };
                break;
            case 'text':
                this.element = document.createElement('p');
                this.propStyles = {
                    textContent: 'טקסט',
                    color: 'black',
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    width: '100%',
                    backgroundColor: 'transparent',
                    borderColor: 'none',
                    borderStyle: 'none',
                    borderWidth: '0px',
                    textAlign: 'justify',
                };
                break;
            case 'image':
                this.element = document.createElement('img');
                this.propStyles = {
                    src: '',
                    borderRadius: '0px',
                    width: '100px',
                    backgroundColor: 'lightgray',
                    height: 'fit-content',
                    borderColor: 'none',
                    borderStyle: 'none',
                    borderWidth: '0px',
                };
                break;
        }

        this.applyStyles();
        this.element.addEventListener('click', () => this.selectElement());
        main.appendChild(this.element);
    }

    applyStyles() {
        for (const key in this.propStyles) {
            this.element.style[key] = this.propStyles[key];
            this.element[key] = this.propStyles[key];
        }
        this.saveToLocalStorage();
    }



    selectElement() {
        // הסרת קלאס 'selected' מכל האלמנטים האחרים לפני סימון האלמנט הנוכחי
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

        // סימון האלמנט הנוכחי כ'נבחר'
        this.element.classList.add('selected');

        // הצגת פאנל עריכה מתאים
        panel.showElementEditingPanel(this);  // העבר את האלמנט עצמו כאן, לא את הסוג
    }

    deselectElement(event) {
        // נוודא שהלחיצה לא התבצעה בתוך האלמנט עצמו או בתוך הפאנל
        if (!this.element.contains(event.target) && !panel.panel.contains(event.target)) {
            this.element.classList.remove('selected');
            panel.showAddingPanel();
        }
    }

    saveToLocalStorage() {
        try {
            // בדוק אם יש כבר אלמנטי שמורים, או התחל מרשימה ריקה
            let savedElements = JSON.parse(localStorage.getItem('elements')) || [];

            // console.log("id:", this.id, "type:", this.type, "propStyles:", this.propStyles);
            // ודא שהשדות אכן מוגדרים
            if (!this.id || !this.type || !this.propStyles) {
                console.error("לא כל השדות הדרושים מוגדרים! id, type, או propStyles חסרים.");
                return;
            }

            // בדוק האם יש אלמנט קיים עם אותו ID
            const elementIndex = savedElements.findIndex(el => el.id === this.id);

            if (elementIndex > -1) {
                // עדכן את האלמנט הקיים במקום להוסיף חדש
                savedElements[elementIndex] = {
                    id: this.id,
                    type: this.type,
                    propStyles: this.propStyles,
                };
                // console.log(`אלמנט עם מזהה ${this.id} עודכן בהצלחה.`);
            } else {
                // אם אין אלמנט קיים, הוסף אותו
                savedElements.push({
                    id: this.id,
                    type: this.type,
                    propStyles: this.propStyles,
                });
                // console.log(`אלמנט חדש נוסף עם מזהה ${this.id}.`);
            }

            // שמור את הרשימה המעודכנת ב-localStorage
            localStorage.setItem('elements', JSON.stringify(savedElements));
            // console.log("האלמנט נשמר בהצלחה:", savedElements);
        } catch (error) {
            console.error("שגיאה בשמירה ל-localStorage:", error);
        }
    }
}


const panel = new Panel();

// Main content section
const main = document.createElement('section');
main.classList.add('main');
document.body.appendChild(main);

let globalId = JSON.parse(localStorage.getItem('globalId')) || 1;
function loadFromLocalStorage() {
    
    // console.log(globalId);
    const savedElements = JSON.parse(localStorage.getItem('elements'));
    if (savedElements) {
        savedElements.forEach(({ id, type, propStyles}) => {
            // console.log(id, type, propStyles);
            // צור אלמנט חדש דרך המחלקה Element
            const elementInstance = new Element(type, id, propStyles);
        });
    }
}



loadFromLocalStorage();



function checkScreenSize() {
    const messageId = "mobile-warning";
    let messageEl = document.getElementById(messageId);

    if (window.innerWidth < 600) {
        if (!messageEl) {
            // יצירת האלמנט של ההודעה
            messageEl = document.createElement('div');
            messageEl.id = messageId;
            messageEl.style.cssText = `
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				background: white;
				border: 2px solid red;
				border-radius: 10px;
				padding: 20px;
				box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
				z-index: 1000;
				text-align: center;
				width: 300px;
			`;

            // תוכן ההודעה
            messageEl.innerHTML = `
				<p style="margin-bottom: 10px;">האתר אינו מותאם לנייד.</p>
				<p style="margin-bottom: 10px;">לחוויה הטובה ביותר, רצוי להשתמש במחשב.</p>
				<button id="close-warning" style="
					background: red;
					color: white;
					border: none;
					padding: 10px 20px;
					border-radius: 5px;
					cursor: pointer;
				">סגור</button>
			`;

            // הוספת האלמנט לגוף
            document.body.appendChild(messageEl);

            // האזנה ללחיצה על כפתור הסגירה
            document.getElementById('close-warning').addEventListener('click', () => {
                messageEl.remove();
            });
        }
    } else if (messageEl) {
        messageEl.remove();
    }
}

// בדיקה בעת טעינת הדף
checkScreenSize();

// בדיקה בעת שינוי גודל המסך
window.addEventListener('resize', checkScreenSize);

