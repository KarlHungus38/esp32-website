import { getCurrentLocation } from './execute_scripts.js';

document.addEventListener("DOMContentLoaded", () => {
    getCurrentLocation(
        async (latitude, longitude) => {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const { sunrise, sunset } = await getSunriseSunsetTimes(latitude, longitude);
            updateWeather(latitude, longitude, timezone, sunrise, sunset);
        },
        async (error) => {
            console.error('Error getting location:', error);
            // Fallback to Berlin's coordinates and timezone if location is not available
            const fallbackSunTimes = await getSunriseSunsetTimes(52.437, 13.721);
            updateWeather(52.437, 13.721, 'Europe/Berlin', fallbackSunTimes.sunrise, fallbackSunTimes.sunset);
        }
    );
});

async function getSunriseSunsetTimes(latitude, longitude) {
    const apiEndpoint = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`;
    try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        return {
            sunrise: new Date(data.results.sunrise),
            sunset: new Date(data.results.sunset)
        };
    } catch (error) {
        console.error('Error fetching sunrise and sunset times:', error);
        return { sunrise: null, sunset: null };
    }
}

async function updateWeather(latitude, longitude, timezone, sunrise, sunset) {
    const apiEndpoint = 'https://api.open-meteo.com/v1/forecast';
    const params = {
        latitude,
        longitude,
        hourly: 'temperature_2m,weathercode',
        start: new Date().toISOString().split('T')[0], // current date in ISO format
        timezone
    };

    const url = `${apiEndpoint}?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly}&start=${params.start}&timezone=${params.timezone}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const weatherData = processWeatherData(data.hourly, params.timezone, sunrise, sunset);
        createWeatherElements(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function processWeatherData(hourlyData, this_timezone, sunrise, sunset) {
    // console.log(hourlyData)
    const weatherIcons = {
        0: 'wi-day-sunny', // Clear sky
        1: 'wi-day-sunny', // Mainly clear
        2: 'wi-day-cloudy', // Partly cloudy
        3: 'wi-cloudy', // Overcast
        45: 'wi-fog', // Fog
        48: 'wi-fog', // Depositing rime fog
        51: 'wi-showers', // Drizzle: Light
        53: 'wi-showers', // Drizzle: Moderate
        55: 'wi-showers', // Drizzle: Dense intensity
        56: 'wi-sleet', // Freezing Drizzle: Light
        57: 'wi-sleet', // Freezing Drizzle: Dense intensity
        61: 'wi-rain', // Rain: Slight
        63: 'wi-rain', // Rain: Moderate
        65: 'wi-rain', // Rain: Heavy intensity
        66: 'wi-rain-mix', // Freezing Rain: Light
        67: 'wi-rain-mix', // Freezing Rain: Heavy intensity
        71: 'wi-snow', // Snow fall: Slight
        73: 'wi-snow', // Snow fall: Moderate
        75: 'wi-snow', // Snow fall: Heavy intensity
        77: 'wi-snowflake-cold', // Snow grains
        80: 'wi-rain', // Rain showers: Slight
        81: 'wi-rain', // Rain showers: Moderate
        82: 'wi-rain', // Rain showers: Violent
        85: 'wi-snow', // Snow showers: Slight
        86: 'wi-snow', // Snow showers: Heavy
        95: 'wi-thunderstorm', // Thunderstorm: Slight or moderate
        96: 'wi-thunderstorm', // Thunderstorm with slight hail
        99: 'wi-thunderstorm', // Thunderstorm with heavy hail
    };

    const starting_hour = parseInt(new Date().toLocaleString('en-US', { timeZone: `${this_timezone}`, hour: 'numeric', hour12: false })) - 5;
    console.log("i changed starting hour in line 88 to see more daytime")

    const hoursToShow = [starting_hour, starting_hour + 1, starting_hour + 2, starting_hour + 3, starting_hour + 5, starting_hour + 8]; // Indices of the hours to show
    const weatherData = hoursToShow.map(index => {
        const sunrise_here = sunrise.toLocaleString('en-US', { timeZone: `${this_timezone}`, hour: 'numeric', hour12: false })
        const sunset_here = sunset.toLocaleString('en-US', { timeZone: `${this_timezone}`, hour: 'numeric', hour12: false })

        const isDayTime = index >= sunrise_here && index < sunset_here;
        let icon = weatherIcons[hourlyData.weathercode[index]] || 'wi-day-sunny';
        if (!isDayTime) {
            if (hourlyData.weathercode[index] === 0 || hourlyData.weathercode[index] === 1) {
                icon = 'wi-night-clear'; // Clear sky at night
            } else if (hourlyData.weathercode[index] === 2) {
                icon = 'wi-night-alt-partly-cloudy'; // Partly cloudy at night
            } else {
                icon = icon.replace('day', 'night');
            }
        }
        return {
            temp: `${hourlyData.temperature_2m[index]}°C`,
            icon: icon,
            description: getDescription(hourlyData.weathercode[index]),
            time: formatTime(index),
            isDayTime: isDayTime, 
        };
    });

    return weatherData;
}

function getDescription(weatherCode) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snowfall',
        73: 'Moderate snowfall',
        75: 'Heavy snowfall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };

    return descriptions[weatherCode] || 'Unknown';
}

function formatTime(hourIndex) {
    const hour = hourIndex % 24;
    return `${hour}:00`;
}

function createWeatherElements(weatherData) {
    const weatherForecast = document.getElementById('weather-forecast');

    weatherData.forEach((data) => {
        const weatherHour = document.createElement('div');
        weatherHour.classList.add('weather-hour');
        // weatherHour.Id = data.icon; 
        const parts = data.icon.split("-");
        const id = parts.slice(1).join("-");
        weatherHour.id = id; 
        if (data.isDayTime) {
            weatherHour.classList.add('weatherday');
        } else {
            weatherHour.classList.add('weathernight');
        }

        const weatherIcon = document.createElement('i');
        weatherIcon.classList.add('weather-icon', 'wi', data.icon);

        const weatherDetails = document.createElement('div');
        weatherDetails.classList.add('weather-details');

        const temperature = document.createElement('h2');
        temperature.classList.add('temperature');
        temperature.textContent = data.temp;

        const time = document.createElement('p');
        time.classList.add('time');
        time.textContent = data.time;

        const description = document.createElement('p');
        description.classList.add('description');
        description.textContent = data.description;

        weatherDetails.appendChild(temperature);
        weatherDetails.appendChild(time);
        weatherDetails.appendChild(description);
        weatherHour.appendChild(weatherIcon);
        weatherHour.appendChild(weatherDetails);
        weatherForecast.appendChild(weatherHour);
    });
}
