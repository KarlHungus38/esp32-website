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
            const stationName = data[0].name;
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
        const timelineElement = document.getElementById('timeline');
        timelineElement.innerHTML = '';  // Clear existing timeline

        if (data.departures && data.departures.length > 0) {
            const now = new Date();
            data.departures.forEach(departure => {
                const actualTime = new Date(departure.when);
                const plannedTime = new Date(departure.plannedWhen);
                const delay = (actualTime - plannedTime) / 60000; // delay in minutes

                const minutesFromNow = (actualTime - now) / 60000; // minutes from now
                const leftPosition = (minutesFromNow / 30) * 100; // percentage position in the 30 min timeline

                const trainElement = document.createElement('div');
                trainElement.className = `train ${getLineClass(departure.line.name)}`;
                trainElement.style.left = `calc(${leftPosition}% - 10px)`;

                trainElement.innerHTML = `
                    <div class="${delay > 0 ? 'delay-line' : 'no-delay-line'}" style="height: ${Math.abs(delay * 3)}px; top: ${delay > 0 ? '-10px' : '0'};"></div>
                    <span>${departure.line.name} to ${departure.direction} at ${actualTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${delay > 0 ? `(Delay: ${delay} min)` : ''}</span>
                `;

                timelineElement.appendChild(trainElement);
            });

            adjustGreenTrainElements();
        } else {
            timelineElement.innerHTML = '<div>No upcoming trains found</div>';
        }
    } catch (error) {
        console.error('Error fetching train data:', error);
        updateTrainScheduleWithError('Error fetching train data');
    }
}

function getLineClass(lineName) {
    if (lineName.startsWith('S')) {
        return 's-line';
    } else if (!isNaN(lineName)) {
        return 'number-line';
    } else {
        return 'other-line';
    }
}

function adjustGreenTrainElements() {
    const greenElements = document.querySelectorAll('.s-line');
    const positions = new Set();

    greenElements.forEach(element => {
        let topPosition = 0;

        while (positions.has(topPosition)) {
            topPosition += 20; // Adjust this value to provide more/less spacing
        }

        element.style.bottom = `${80 + topPosition}px`;
        positions.add(topPosition);
    });
}

function updateTrainScheduleWithError(message) {
    const timelineElement = document.getElementById('timeline');
    timelineElement.innerHTML = `<div>${message}</div>`;
}
