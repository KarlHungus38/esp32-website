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
        
        const train_board = document.createElement('div'); 
        train_board.id = 'train-board';
        trainsElement.appendChild(train_board);

        if (data.departures && data.departures.length > 0) {
            const train_h3 = document.createElement('h3'); 
            train_h3.textContent = stationname.split("(")[0];
            trainsElement.insertBefore(train_h3, train_board);

            data.departures.forEach(departure => {
                const actualTime = new Date(departure.when);
                const plannedTime = new Date(departure.plannedWhen);
                const delay = (actualTime - plannedTime) / 60000; // delay in minutes
                const formattedTime = actualTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const train_entry = document.createElement('div');
                train_entry.className = 'train-entry';

                const train_time = document.createElement('span');
                train_time.className = 'train-time';
                train_time.textContent = formattedTime;

                const train_destination = document.createElement('span');
                train_destination.className = 'train-destination';
                train_destination.textContent = `${departure.line.name} to ${departure.destination.name.split("(")[0]}`;

                const train_status = document.createElement('span');
                train_status.className = 'train-status';
                train_status.textContent = delay > 0 ? `${delay} min delay` : 'On time';

                train_entry.appendChild(train_time);
                train_entry.appendChild(train_destination);
                train_entry.appendChild(train_status);
                train_board.appendChild(train_entry);
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
