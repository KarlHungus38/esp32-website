import { getCurrentLocation } from './execute_scripts.js';

document.addEventListener("DOMContentLoaded", () => {
    getCurrentLocation(
        (latitude, longitude, stationid, stationName) => {
            updateTrainSchedule(stationid, stationName); // Or use findNearbyStation(latitude, longitude); once implemented
        },
        (error) => {
            console.error('Error getting location:', error);
            updateTrainScheduleWithError('Error getting location');
        }
    );
});

async function updateTrainSchedule(stationId, stationname) {
    const url = `https://v5.db.transport.rest/stops/${stationId}/departures?duration=30`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const trainsElement = document.querySelector('.trains');
        trainsElement.innerHTML = ''; // Clear existing timeline

        // Create sections
        const sTrainsSection = document.createElement('div');
        sTrainsSection.id = 's-trains-section';
        trainsElement.appendChild(sTrainsSection);

        const stationNameSection = document.createElement('div');
        stationNameSection.className = 'station-name';
        stationNameSection.textContent = stationname.split("(")[0];
        trainsElement.appendChild(stationNameSection);

        const busesSection = document.createElement('div');
        busesSection.id = 'buses-section';
        trainsElement.appendChild(busesSection);

        if (data.length > 0) {
            data.forEach(departure => {
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
                destinationSpan.textContent = `${departure.line.name} nach ${departure.destination.name.split("(")[0].replace("S ", "")}`;

                const statusSpan = document.createElement('span');
                statusSpan.className = isSTrain ? 'train-status' : 'bus-status';
                statusSpan.textContent = delay > 0 ? `+ ${delay} min` : 'On time';

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
