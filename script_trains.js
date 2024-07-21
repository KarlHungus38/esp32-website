document.addEventListener("DOMContentLoaded", () => {
    getCurrentLocation();
});

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            findNearbyStation(latitude, longitude);
        }, error => {
            console.error('Error getting location:', error);
            updateTrainScheduleWithError('Error getting location');

        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        updateTrainScheduleWithError('Geolocation is not supported by this browser.');
    }
}

function findNearbyStation(latitude, longitude) {
    const url = `https://v6.bvg.transport.rest/locations/nearby?results=1&latitude=${latitude}&longitude=${longitude}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0 && data[0].id) {
                const stationId = data[0].id;
                const stationName = data[0].name;
                document.querySelector('.trains h1').textContent = stationName;
                updateTrainSchedule(stationId);
            } else {
                console.error('No nearby station found.');
                updateTrainScheduleWithError('No nearby station found');
            }
        })
        .catch(error => {
            console.error('Error fetching nearby station:', error);
            updateTrainScheduleWithError('Error fetching nearby station');
        });
}

function updateTrainSchedule(stationId) {
    const url = `https://v6.bvg.transport.rest/stops/${stationId}/departures?duration=30`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const scheduleElement = document.getElementById('train-schedule');
            scheduleElement.innerHTML = '';  // Clear existing schedule

            console.log('Train schedule:',stationId, data);

            if (data.departures && data.departures.length > 0) {
                data.departures.forEach(departure => {
                    const actualTime = new Date(departure.when);
                    const plannedTime = new Date(departure.plannedWhen);
                    const delay = Math.round((actualTime - plannedTime) / 6000) / 10; // delay in minutes, rounded to 1 decimal place

                    const listItem = document.createElement('li');
                    listItem.textContent = `${departure.line.name} to ${departure.direction}: ${actualTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Delay: ${delay} min)`;
                    scheduleElement.appendChild(listItem);
                });
            } else {
                scheduleElement.innerHTML = '<li>No upcoming trains found</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching train data:', error);
            updateTrainScheduleWithError('Error fetching train data');
        });
}

function updateTrainScheduleWithError(message) {
    const scheduleElement = document.getElementById('train-schedule');
    scheduleElement.innerHTML = `<li>${message}</li>`;
}
