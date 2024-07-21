document.addEventListener("DOMContentLoaded", () => {
    updateWeather();
    updateTrainSchedule();
});

async function updateWeather() {
    // Define the API endpoint and parameters
    const apiEndpoint = 'https://api.open-meteo.com/v1/forecast';
    const params = {
        latitude: 52.437, // Berlin's latitude 
        longitude: 13.721, // Berlin's longitude
        hourly: 'temperature_2m,weathercode',
        start: new Date().toISOString().split('T')[0], // current date in ISO format
        timezone: 'Europe/Berlin'
    };

    // Construct the full URL
    const url = `${apiEndpoint}?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly}&start=${params.start}&timezone=${params.timezone}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const weatherData = processWeatherData(data.hourly);
        createWeatherElements(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function processWeatherData(hourlyData) {
    console.log(hourlyData);
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


    const starting_hour = parseInt(new Date().toISOString().split('T')[1].split(':')[0]) + 2
    

    const hoursToShow = [starting_hour, starting_hour+1, starting_hour+2, starting_hour+3, starting_hour+5, starting_hour+8]; // Indices of the hours to show
    const weatherData = hoursToShow.map(index => ({
        temp: `${hourlyData.temperature_2m[index]}°C`,
        icon: weatherIcons[hourlyData.weathercode[index]] || 'wi-day-sunny',
        description: getDescription(hourlyData.weathercode[index]),
        time: formatTime(index)
    }));

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
    const times = ['Now', '+1 Hour', '+2 Hours', '+3 Hours', '22:00', 'Midnight'];
    return `${hour}:00`;
}

function createWeatherElements(weatherData) {
    const weatherForecast = document.getElementById('weather-forecast');

    weatherData.forEach((data, index) => {
        const weatherHour = document.createElement('div');
        weatherHour.classList.add('weather-hour');
        weatherHour.id = `hour${index + 1}`;

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

function updateTrainSchedule() {
    // This function should call a train schedule API and update the DOM
    // Example:
    // fetch('your-train-schedule-api-url')
    //     .then(response => response.json())
    //     .then(data => {
    //         const schedule = data.trains.map(train => `<li>${train.name}: ${train.time}</li>`).join('');
    //         document.getElementById('train-schedule').innerHTML = schedule;
    //     });

    // Sample data for demonstration
    const schedule = `
        <li>Train 1: 10:30</li>
        <li>Train 2: 10:45</li>
        <li>Train 3: 11:00</li>
        <li>Train 4: 11:15</li>
    `;
    document.getElementById('train-schedule').innerHTML = schedule;
}
