import { getCurrentLocation } from './execute_scripts.js';

document.addEventListener("DOMContentLoaded", () => {
    getCurrentLocation(
        (latitude, longitude) => {
            findNearbyStation(latitude, longitude); // Or use findNearbyStation(latitude, longitude); once implemented
        },
        (error) => {
            console.error('Error getting location:', error);
            updateTrainScheduleWithError('Error getting location');
        }
    );
});

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
            // document.querySelector('.trains h3').textContent = stationName;
            // document.querySelector('.trains h3').textContent = "line 44 stations name is old code";
            updateTrainSchedule(stationId, stationName);
        } else {
            console.error('No nearby station found.');
            updateTrainScheduleWithError('No nearby station found');
        }
    } catch (error) {
        console.error('Error fetching nearby station:', error);
        updateTrainScheduleWithError('Error fetching nearby station');
    }
}

async function updateTrainSchedule(stationId, stationname) {
    const url = `https://v6.bvg.transport.rest/stops/${stationId}/departures?duration=30`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const trainsElement = document.querySelector('.trains');
        trainsElement.innerHTML = ''; // Clear existing timeline

        // Create sections
        const stationNameSection = document.createElement('div');
        stationNameSection.className = 'station-name';
        stationNameSection.textContent = stationname.split("(")[0];
        trainsElement.appendChild(stationNameSection);

        const sTrainsSection = document.createElement('div');
        sTrainsSection.id = 's-trains-section';
        trainsElement.appendChild(sTrainsSection);

        const busesSection = document.createElement('div');
        busesSection.id = 'buses-section';
        trainsElement.appendChild(busesSection);

        if (data.departures && data.departures.length > 0) {
            data.departures.forEach(departure => {
                const actualTime = new Date(departure.when);
                const plannedTime = new Date(departure.plannedWhen);
                const delay = (actualTime - plannedTime) / 60000; // delay in minutes
                const formattedTime = actualTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const isSTrain = departure.line.name.startsWith('S');
                const entrySection = isSTrain ? sTrainsSection : busesSection;

                const entry = document.createElement('div');
                entry.className = isSTrain ? 'train-entry' : 'bus-entry';

                const timeSpan = document.createElement('span');
                timeSpan.className = isSTrain ? 'train-time' : 'bus-time';
                timeSpan.textContent = formattedTime;

                const destinationSpan = document.createElement('span');
                destinationSpan.className = isSTrain ? 'train-destination' : 'bus-destination';
                destinationSpan.textContent = `${departure.line.name} to ${departure.destination.name.split("(")[0]}`;

                const statusSpan = document.createElement('span');
                statusSpan.className = isSTrain ? 'train-status' : 'bus-status';
                statusSpan.textContent = delay > 0 ? `${delay} min delay` : 'On time';

                entry.appendChild(timeSpan);
                entry.appendChild(destinationSpan);
                entry.appendChild(statusSpan);
                entrySection.appendChild(entry);
            });

        } else {
            trainsElement.innerHTML = '<div>No upcoming trains found</div>';
        }
    } catch (error) {
        console.error('Error fetching train data:', error);
        trainsElement.innerHTML = '<div>Error fetching train data</div>';
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
    const timelineElement = document.getElementById('train-board');
    timelineElement.innerHTML = `<div>${message}</div>`;
}
