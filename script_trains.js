document.addEventListener("DOMContentLoaded", () => {
    getCurrentLocation();
});

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            findNearbyStation(52.438, 13.721);

            // findNearbyStation(latitude, longitude);
        }, error => {
            console.error('Error getting location:', error);
            updateTrainScheduleWithError('Error getting location');
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        updateTrainScheduleWithError('Geolocation is not supported by this browser.');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            if (i < retries - 1) {
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
}

async function findNearbyStation(latitude, longitude) {
    const url = `https://v6.bvg.transport.rest/locations/nearby?results=1&latitude=${latitude}&longitude=${longitude}`;

    try {
        const data = await fetchWithRetry(url);
        if (data.length > 0 && data[0].id) {
            const stationId = data[0].id;
            const stationName = data[0].name.split("(")[0];
            console.log(`Nearby station: ${stationName} (${stationId})`);

            document.querySelector('.trains h1').textContent = stationName;
            updateTrainSchedule(stationId);
        } else {
            console.error('No nearby station found.');
            updateTrainScheduleWithError('No nearby station found');
        }
    } catch (error) {
        console.error('Error fetching nearby station:', error);
        updateTrainScheduleWithError('Error fetching nearby station');
    }
}

async function updateTrainSchedule(stationId) {
    const url = `https://v6.bvg.transport.rest/stops/${stationId}/departures?duration=30`;

    try {
        const data = await fetchWithRetry(url);
        const scheduleElement = document.getElementById('train-schedule');
        scheduleElement.innerHTML = '';  // Clear existing schedule

        if (data.departures && data.departures.length > 0) {
            data.departures.forEach(departure => {
                const actualTime = new Date(departure.when);
                const plannedTime = new Date(departure.plannedWhen);
                const delay = Math.round((actualTime - plannedTime) / 6000) / 10; // delay in minutes, rounded to 1 decimal place
                const station_name = departure.direction.split("(")[0];
                
                const listItem = document.createElement('li');
                listItem.textContent = `${departure.line.name} ${station_name}: ${actualTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Delay: ${delay} min)`;
                scheduleElement.appendChild(listItem);
            });
        } else {
            scheduleElement.innerHTML = '<li>No upcoming trains found</li>';
        }
    } catch (error) {
        console.error('Error fetching train data:', error);
        updateTrainScheduleWithError('Error fetching train data');
    }
}

function updateTrainScheduleWithError(message) {
    const scheduleElement = document.getElementById('train-schedule');
    scheduleElement.innerHTML = `<li>${message}</li>`;
}
