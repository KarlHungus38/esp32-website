// Importing functions from other scripts
import { updateTrainSchedule } from './script_trains.js';
import { updateWeather } from './script_weather.js';

// Function to extract query parameter from the URL
function getQueryParam(param) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    return params.get(param);
}

// Function to get location data from the API
async function getLocationData(query) {
    const apiUrl = `https://v5.db.transport.rest/locations?query=${query}&fuzzy=true&results=1&stops=true&addresses=true&poi=true&linesOfStops=false&language=de`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error('Error fetching location data:', error);
        throw error;
    }
}

// Function to get current location
export async function getCurrentLocation(successCallback, errorCallback) {
    const locationQuery = getQueryParam('station');

    if (locationQuery) {
        try {
            const locationData = await getLocationData(locationQuery);
            const latitude = locationData.location.latitude;
            const longitude = locationData.location.longitude;
            const stationId = locationData.id;
            const stationName = locationData.name;
            successCallback(latitude, longitude, stationId, stationName);
        } catch (error) {
            errorCallback(error);
        }
    } else {
        console.error('No location query parameter found in the URL.');
        errorCallback(new Error('No location query parameter found in the URL.'));
    }
}

// Function to download a screenshot
function downloadScreenshot() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'screenshot.png';
        link.click();
    });
}

// Execute functions from the imported scripts when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    getCurrentLocation(
        async (latitude, longitude, stationId, stationName) => {
            try {
                // Wait for both updateTrainSchedule and updateWeather to finish
                await Promise.all([
                    updateTrainSchedule(stationId, stationName),
                    updateWeather(latitude, longitude)
                ]);

                // Check if download=true is in the URL and trigger screenshot download if true
                if (getQueryParam('download') === 'true') {
                    downloadScreenshot();
                }
            } catch (error) {
                console.error('Error executing updates:', error);
            }
        },
        (error) => {
            console.error('Error getting location:', error);
        }
    );
});
