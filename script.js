const apiKey = '95e36ef25b6f405f6658d11f28013f6f';
const defaultCity = 'Chennai';

document.addEventListener('DOMContentLoaded', () => {
    fetchWeather(defaultCity);
    document.getElementById('searchBtn').addEventListener('click', () => {
        const city = document.getElementById('search').value;
        if (city) {
            fetchWeather(city);
        }
    });
});

async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            // Also fetch hourly forecast
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
            const forecastData = await forecastResponse.json();
            
            updateUI(data);
            updateForecast(forecastData);
        } else {
            alert('City not found!');
        }
    } catch (error) {
        console.error(error);
        alert('Error fetching data!');
    }
}

function getWeatherEmoji(weather) {
    const time = new Date().getHours();
    const isNight = time < 6 || time > 18;
    const mainWeather = weather.main.toLowerCase();
    
    switch (mainWeather) {
        case 'clear':
            return isNight ? '🌙' : '☀️';
        case 'clouds':
            return weather.description.includes('few') ? '🌤️' : 
                   weather.description.includes('scattered') ? '⛅' : 
                   weather.description.includes('broken') ? '☁️' : '☁️';
        case 'rain':
            return weather.description.includes('light') ? '🌦️' : 
                   weather.description.includes('heavy') ? '⛈️' : '🌧️';
        case 'thunderstorm':
            return '⛈️';
        case 'snow':
            return weather.description.includes('light') ? '🌨️' : '❄️';
        case 'mist':
        case 'fog':
            return '🌫️';
        case 'haze':
            return '😶‍🌫️';
        default:
            return '🌈';
    }
}

function getBackground(weather) {
    const time = new Date().getHours();
    const isNight = time < 6 || time > 18;
    const mainWeather = weather.main.toLowerCase();
    
    const backgrounds = {
        clear: {
            day: 'linear-gradient(to bottom, #FF8C00, #FFD700)',
            night: 'linear-gradient(to bottom, #1a1a3a, #4a4a8a)'
        },
        clouds: {
            day: 'linear-gradient(to bottom, #647687, #9CA5B1)',
            night: 'linear-gradient(to bottom, #2C3E50, #3498DB)'
        },
        rain: {
            day: 'linear-gradient(to bottom, #4B79A1, #283E51)',
            night: 'linear-gradient(to bottom, #1F1C2C, #928DAB)'
        },
        thunderstorm: {
            day: 'linear-gradient(to bottom, #23074d, #cc5333)',
            night: 'linear-gradient(to bottom, #0f0c29, #302b63)'
        },
        snow: {
            day: 'linear-gradient(to bottom, #E6DADA, #274046)',
            night: 'linear-gradient(to bottom, #649173, #DBD5A4)'
        },
        mist: {
            day: 'linear-gradient(to bottom, #757F9A, #D7DDE8)',
            night: 'linear-gradient(to bottom, #1F1C2C, #928DAB)'
        }
    };

    return backgrounds[mainWeather] ? 
           (isNight ? backgrounds[mainWeather].night : backgrounds[mainWeather].day) : 
           'linear-gradient(to bottom, #87CEEB, #f8f9fa)';
}

function updateUI(data) {
    const { name, main, weather, wind, sys, visibility, clouds } = data;

    document.getElementById('location').innerText = name;
    document.getElementById('temperature').innerText = `${Math.round(main.temp)}°C`;
    document.getElementById('emoji').innerText = getWeatherEmoji(weather[0]);
    document.getElementById('description').innerText = weather[0].description;
    document.getElementById('humidity').innerText = `${main.humidity}%`;
    document.getElementById('wind-speed').innerText = `${(wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('pressure').innerText = `${main.pressure} hPa`;
    document.getElementById('sunrise').innerText = formatTime(sys.sunrise);
    document.getElementById('sunset').innerText = formatTime(sys.sunset);
    document.getElementById('visibility').innerText = `${(visibility / 1000).toFixed(1)} km`;
    document.getElementById('wind-direction').innerText = `${wind.deg}°`;
    document.getElementById('cloudiness').innerText = `${clouds.all}%`;
    document.getElementById('date-time').innerText = new Date().toLocaleString();
    
    document.body.style.background = getBackground(weather[0]);

    const weatherCard = document.querySelector('.weather-card');
    weatherCard.className = 'weather-card';
    weatherCard.classList.add(`weather-${weather[0].main.toLowerCase()}`);
    
    const hour = new Date().getHours();
    if (hour < 6 || hour > 18) {
        document.body.classList.add('night-mode');
    } else {
        document.body.classList.remove('night-mode');
    }
}

function updateForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    const next24Hours = forecastData.list.slice(0, 8);
    
    next24Hours.forEach(item => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div>${formatTime(item.dt)}</div>
            <div>${getWeatherEmoji(item.weather[0])}</div>
            <div>${Math.round(item.main.temp)}°C</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

