const apiKey = '125944bb58ba54543ffa210fb034b8ba';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');


document.addEventListener('DOMContentLoaded', () => {
    const savedCity = localStorage.getItem('city');
    if (savedCity) {
        cityInput.value = savedCity; // แสดงชื่อเมืองใน input
        getWeather(savedCity);       // โหลดสภาพอากาศอัตโนมัติ
    }
});

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
        return;
    }
    localStorage.setItem('city', cityName);

    getWeather(cityName);
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;
    const apiforecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();

        const forecast = await fetch(apiforecast);
        if(!forecast.ok){
            throw new Error('ไม่พบข้อมูลพยากรอากาศล่วงหน้า');
        }
        const forecastData = await forecast.json();

        displayWeather(data);
        displayForecast5Days(forecastData);

        return city;
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});


function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];
   
    const today = new Date().toLocaleDateString("th-TH", {
        weekday: "long",   // ชื่อวัน เช่น "วันอาทิตย์"
        year: "numeric",   // ปี ค.ศ.
        month: "long",     // เดือนแบบเต็ม
        day: "numeric"     // วันที่
    });

    const weatherHtml = `
        <h3 class="text-lg font-semibold">${today}</h3>
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

function displayForecast5Days(data) {
    const days = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString("th-TH");
        if (!days[date]) {
            days[date] = {
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min,
                weather: item.weather[0]
            };
        } else {
            days[date].temp_max = Math.max(days[date].temp_max, item.main.temp_max);
            days[date].temp_min = Math.min(days[date].temp_min, item.main.temp_min);
        }
    });

    const entries = Object.entries(days);
    let forecastHtml = '<div class="forecast-container">';
    let count = 0;
    for (const [date, info] of entries.slice(0)) {
        if (count >= 5) break; 
        const icon = `https://openweathermap.org/img/wn/${info.weather.icon}@2x.png`;
        forecastHtml += `
            <div class="weather-card">
                <h3>${date}</h3>
                <img src="${icon}" alt="${info.weather.description}" class="weather-icon" />
                <p class="temp">สูงสุด: ${Math.round(info.temp_max)}°C</p>
                <p class="temp">ต่ำสุด: ${Math.round(info.temp_min)}°C</p>
                <p>${info.weather.description}</p>
            </div>
        `;
        count++;
    }
    forecastHtml += '</div>';

    weatherInfoContainer.innerHTML += forecastHtml;
}

