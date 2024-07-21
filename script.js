document.addEventListener("DOMContentLoaded", () => {
    updateWeather();
    updateTrainSchedule();
});

function updateWeather() {
    // This function should call a weather API and update the DOM
    // Example:
    // fetch('your-weather-api-url')
    //     .then(response => response.json())
    //     .then(data => {
    //         updateWeatherHour('hour1', data.hour1);
    //         updateWeatherHour('hour2', data.hour2);
    //         updateWeatherHour('hour3', data.hour3);
    //         updateWeatherHour('hour4', data.hour4);
    //         updateWeatherHour('hour22', data.hour22);
    //         updateWeatherHour('hourMidnight', data.hourMidnight);
    //     });

    // Sample data for demonstration
    const weatherData = {
        hour1: { temp: '25°C', icon: 'sunny.png', description: 'Sunny', time: 'Now' },
        hour2: { temp: '38°C', icon: 'sunny.png', description: 'Sunny', time: '+1 Hour' },
        hour3: { temp: '23°C', icon: 'sunny.png', description: 'Sunny', time: '+2 Hours' },
        hour4: { temp: '22°C', icon: 'sunny.png', description: 'Sunny', time: '+3 Hours' },
        hour22: { temp: '20°C', icon: 'clear-night.png', description: 'Clear', time: '22:00' },
        hourMidnight: { temp: '18°C', icon: 'clear-night.png', description: 'Clear', time: 'Midnight' },
    };

    updateWeatherHour('hour1', weatherData.hour1);
    updateWeatherHour('hour2', weatherData.hour2);
    updateWeatherHour('hour3', weatherData.hour3);
    updateWeatherHour('hour4', weatherData.hour4);
    updateWeatherHour('hour22', weatherData.hour22);
    updateWeatherHour('hourMidnight', weatherData.hourMidnight);
}

function updateWeatherHour(elementId, data) {
    const element = document.getElementById(elementId);
    element.querySelector('.weather-icon').src = data.icon;
    element.querySelector('.temperature').textContent = data.temp;
    element.querySelector('.description').textContent = data.description;
    element.querySelector('.time').textContent = data.time;
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
