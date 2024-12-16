const API_KEY = "11fdec72b370a338684eda60b62c161a";
const form = document.getElementById('weather-form');
const resultsContainer = document.getElementById('weather-results');
const errorContainer = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading-indicator');

// יצירת משתנים גלובליים לאלמנטים
const cityNameElement = document.getElementById('city-name');
const temperatureElement = document.getElementById('temperature');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const weatherDescriptionElement = document.getElementById('weather-description');
const clothingRecommendationElement = document.getElementById('clothing-recommendation');
const hourlyForecastElement = document.getElementById('hourly-forecast');
const dailyForecastElement = document.getElementById('daily-forecast');

// פונקציה להצגת מזג האוויר
async function displayWeather(data, city) {
    cityNameElement.textContent = city || 'המיקום הנוכחי';
    temperatureElement.textContent = data.main && data.main.temp ? Math.round(data.main.temp) : 'לא זמין';
    feelsLikeElement.textContent = data.main && data.main.feels_like ? Math.round(data.main.feels_like) : 'לא זמין';
    humidityElement.textContent = data.main && data.main.humidity !== undefined ? data.main.humidity : 'לא זמין';
    windSpeedElement.textContent = data.wind && data.wind.speed !== undefined ? data.wind.speed : 'לא זמין';
    weatherDescriptionElement.textContent = data.weather && data.weather[0] ? data.weather[0].description : 'לא זמין';

    const clothingRecommendation = getClothingRecommendation(data.main && data.main.temp ? data.main.temp : null);
    clothingRecommendationElement.textContent = clothingRecommendation || 'לא זמין';

    resultsContainer.classList.remove('hidden');

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=he`);

    const forecastData = await response.json();

    // הצגת תחזית שעתית (הפונקציה תטען בנפרד)
    await display3HourForecast(forecastData);

    // הצגת תחזית יומית (הפונקציה תטען בנפרד)
    await displayDailyForecast(forecastData);


}

// פונקציה ליצירת תחזית יומית
function generateDailyForecastHTML(dailyData) {
    if (!dailyData) return ''; // אם אין נתונים יומיים

    return dailyData.slice(1, 5).map(day => `
        <div>
            <p>${new Date(day.dt * 1000).toLocaleDateString('he-IL')}</p>
            <p>מינימום: ${day.temp && day.temp.min ? Math.round(day.temp.min) : 'לא זמין'}°C</p>
            <p>מקסימום: ${day.temp && day.temp.max ? Math.round(day.temp.max) : 'לא זמין'}°C</p>
        </div>
    `).join('');
}

// Adjusted function to display 3-hourly forecast
async function display3HourForecast(data) {
    if (!data || !data.list) {
        hourlyForecastElement.innerHTML = 'נתונים שעתיים לא זמינים';
        return;
    }

    const hourly = generateHourlyForecastHTML(data.list);
    hourlyForecastElement.innerHTML = hourly;
}

// Adjusted function to generate HTML for 3-hourly forecast
function generateHourlyForecastHTML(hourlyData) {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const today = new Date();
    const todayDayIndex = today.getDay();

    // Helper to determine the day label (Today, Tomorrow, etc.)
    const getDayLabel = (entryDate) => {
        const entryDayIndex = entryDate.getDay();
        if (entryDayIndex === todayDayIndex) return 'היום';
        if (entryDayIndex === (todayDayIndex + 1) % 7) return 'מחר';
        if (entryDayIndex === (todayDayIndex + 2) % 7) return 'מחרתיים';
        return `יום ${days[entryDayIndex]}`;
    };

    return hourlyData.map(entry => {
        const entryDate = new Date(entry.dt * 1000);
        const dayLabel = getDayLabel(entryDate); // Determine day label

        return `
			<div class="weather-column">
				<p class="day-label">${dayLabel}</p>
				<p>${entryDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
				<p>${entry.main && entry.main.temp ? Math.round(entry.main.temp) : 'לא זמין'}°C</p>
				<p class="two-lines">${entry.weather && entry.weather[0] ? entry.weather[0].description : 'לא זמין'}</p>
				<p>רוח: ${entry.wind && entry.wind.speed ? entry.wind.speed.toFixed(1) : 'לא זמין'} מ/ש</p>
				<p>סיכוי גשם: ${entry.pop ? (entry.pop * 100).toFixed(0) + '%' : 'לא זמין'}</p>
				<p>ראות: ${entry.visibility ? entry.visibility / 1000 : 'לא זמין'} ק"מ</p>
			</div>
		`;
    }).join('');
}


// Adjusted function to display daily forecast
async function displayDailyForecast(data) {
    if (!data || !data.list) {
        dailyForecastElement.innerHTML = 'נתונים יומיים לא זמינים';
        return;
    }

    const daily = generateDailyForecastHTML(data.list);
    dailyForecastElement.innerHTML = daily;
}

// Adjusted function to generate HTML for daily forecast
function generateDailyForecastHTML(dailyData) {
    const groupedByDate = dailyData.reduce((acc, entry) => {
        const date = new Date(entry.dt * 1000);
        const dateStr = date.toLocaleDateString('he-IL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(entry);
        return acc;
    }, {});

    return Object.entries(groupedByDate)
        .map(([date, entries], index) => {
            const tempMin = Math.round(Math.min(...entries.map(e => e.main?.temp_min || Infinity)));
            const tempMax = Math.round(Math.max(...entries.map(e => e.main?.temp_max || -Infinity)));
            const avgPop = Math.round((entries.reduce((acc, e) => acc + (e.pop || 0), 0) / entries.length) * 100);
            const commonIcon = entries[0]?.weather?.[0]?.icon?.replace('n', 'd') || "01d";
            const description = entries[0]?.weather?.[0]?.description || "";

            return `
                <div class="${index === 0 ? 'today' : ''}" >
                    <div class="forecast-date">
                        <h3>${date}</h3>
                        ${index === 0 ? '<span class="today-badge">היום</span>' : ''}
                    </div>
                    
                    <div class="forecast-content">
<figure class="forecast-icon">
	<img src="http://openweathermap.org/img/wn/${commonIcon}@2x.png" 
	     alt="${description}">
	<figcaption>${description}</figcaption>
</figure>
                        
                        <div class="forecast-details">
                            <div class="temp-range">

                                <div class="temp-separator"></div>
                                <div class="temp temp-max">
                                    <span class="label">מקסימום</span>
                                    <span class="value">${tempMax}°</span>
                                </div>
                                                                <div class="temp temp-min">
                                    <span class="label">מינימום</span>
                                    <span class="value">${tempMin}°</span>
                                </div>
                            </div>
                            
                            <div class="precipitation">
                                <span class="rain-icon">💧</span>
                                <span class="rain-chance">${avgPop}% סיכוי למשקעים</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}





function getClothingRecommendation(temp, feelsCold = false, feelsHot = false) {
    let baseRecommendation = '';
    let sensitiveToHotRecommendation = '';
    let sensitiveToColdRecommendation = '';

    if (temp < 10) {
        baseRecommendation = 'מומלץ ללבוש שכבות: חולצה ארוכה, סוודר חם ומעיל עבה. כדאי להוסיף צעיף, כפפות וכובע חם.';
        sensitiveToHotRecommendation = 'אם אתם רגישים לחום - אפשר להסתפק בשכבה פחות: מעיל בינוני או סוודר עבה בלבד.';
        sensitiveToColdRecommendation = 'אם אתם רגישים לקור - מומלץ להוסיף שכבה תרמית מתחת לבגדים, גרביים עבות וצעיף שמכסה גם את הצוואר.';
    }
    else if (temp < 15) {
        baseRecommendation = 'מומלץ ללבוש חולצה ארוכה, סוודר ומעיל קל או ג\'קט. כדאי לקחת צעיף.';
        sensitiveToHotRecommendation = 'אם אתם רגישים לחום - סוודר עבה או ג\'קט יספיקו.';
        sensitiveToColdRecommendation = 'אם אתם רגישים לקור - מומלץ להוסיף שכבה נוספת ולשים דגש על כיסוי הצוואר והידיים.';
    }
    else if (temp < 20) {
        baseRecommendation = 'מומלץ ללבוש חולצה ארוכה וסוודר או ג\'קט קל. קחו שכבה נוספת למקרה שיהיה קר.';
        sensitiveToHotRecommendation = 'אם אתם רגישים לחום - חולצה ארוכה עם ג\'קט דק יספיקו.';
        sensitiveToColdRecommendation = 'אם אתם רגישים לקור - מומלץ להוסיף סוודר דק מתחת לג\'קט.';
    }
    else if (temp < 25) {
        baseRecommendation = 'מומלץ ללבוש חולצה קצרה עם שכבה נוספת כמו חולצה ארוכה דקה או קרדיגן קל.';
        sensitiveToHotRecommendation = 'אם אתם רגישים לחום - חולצה קצרה תספיק, קחו שכבה נוספת בתיק.';
        sensitiveToColdRecommendation = 'אם אתם רגישים לקור - מומלץ ללבוש חולצה ארוכה וסוודר דק.';
    }
    else if (temp < 30) {
        baseRecommendation = 'מומלץ ללבוש בגדים קלים: חולצה קצרה ומכנסיים קלים. כדאי לקחת כובע להגנה מהשמש.';
        sensitiveToHotRecommendation = 'אם אתם רגישים לחום - בחרו בבגדים מבד נושם במיוחד, רצוי בצבעים בהירים.';
        sensitiveToColdRecommendation = 'אם אתם רגישים לקור - אפשר להוסיף חולצה דקה ארוכה מעל החולצה הקצרה.';
    }
    else {
        baseRecommendation = 'מומלץ ללבוש בגדים קלים מאוד: חולצה קצרה ומכנסיים קצרים. חשוב להגן על העור עם קרם הגנה וכובע רחב שוליים.';
        sensitiveToHotRecommendation = 'אם אתם רגישים לחום - הימנעו משהייה בשמש, לבשו בגדים רפויים מכותנה או בדים נושמים אחרים, ושתו לפחות כוס מים בשעה.';
        sensitiveToColdRecommendation = 'אם אתם רגישים לקור - אפשר ללבוש חולצה דקה ארוכה למרות החום.';
    }

    // בניית ההמלצה המלאה בהתאם להעדפות המשתמש
    let fullRecommendation = baseRecommendation;
    if (feelsCold) {
        fullRecommendation += '\n' + sensitiveToColdRecommendation;
    }
    if (feelsHot) {
        fullRecommendation += '\n' + sensitiveToHotRecommendation;
    }

    // הוספת המלצות כלליות לפי הטמפרטורה
    if (temp >= 28) {
        fullRecommendation += '\nחשוב: להצטייד בהרבה מים, להימנע מפעילות מאומצת בשעות החמות, ולהישאר בצל כשאפשר.';
    } else if (temp <= 12) {
        fullRecommendation += '\nטיפ: כדאי ללבוש כמה שכבות דקות במקום שכבה עבה אחת - כך קל יותר להתאים את הלבוש לתנאי מזג האוויר המשתנים.';
    }

    return fullRecommendation;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    resultsContainer.classList.add('hidden');
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});



async function getWeatherByCity(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=he&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        // בדוק אם יש שגיאה בתשובה
        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        // הצג נתוני מזג האוויר
        displayWeather(data, city);
        errorContainer.classList.add("hidden");
    } catch (error) {
        console.error("שגיאה בזיהוי המזג האוויר:", error.message);
        errorContainer.textContent = "שגיאה בקבלת נתוני מזג האוויר.";
        errorContainer.classList.remove("hidden");
    }
}

async function getCityName(lat, lon) {
    try {
        // קריאה ל-API לזיהוי שם העיר
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
            // החזרת שם העיר בעברית אם קיים
            let hebrewCityName = data[0].local_names?.he || data[0].name;

            hebrewCityName = hebrewCityName.replace(/תל[־ ]אביב[־– ]?יפו/, 'תל אביב');

            return hebrewCityName
        } else {
            throw new Error("עיר לא נמצאה.");
        }
    } catch (error) {
        console.error("שגיאה בזיהוי העיר:", error.message);
        return null;
    }
}
async function getCurrentLocation() {
    if (navigator.geolocation) {
        // אם המכשיר תומך ב-GPS, נשיג את המיקום
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            // קרא לפונקציה שמביאה את שם העיר מהקואורדינטות
            const city = await getCityName(latitude, longitude);

            // אם קיבלנו את שם העיר, נשלח אותו לפונקציה שמביאה את מזג האוויר
            if (city) {
                await getWeatherByCity(city);
            } else {
                console.error("לא ניתן לזהות את העיר.");
                errorContainer.textContent = "לא ניתן לזהות את העיר.";
                errorContainer.classList.remove('hidden');
            }
        }, (error) => {
            console.error("שגיאה בזיהוי המיקום:", error.message);
            errorContainer.textContent = "לא ניתן לזהות את המיקום הנוכחי.";
            errorContainer.classList.remove('hidden');
        });
    } else {
        console.error("המכשיר לא תומך בזיהוי מיקום.");
        errorContainer.textContent = "המכשיר לא תומך בזיהוי מיקום.";
        errorContainer.classList.remove('hidden');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        getCurrentLocation();
    }
});