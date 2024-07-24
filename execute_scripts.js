// Function to extract query parameter from the URL
function getQueryParam(param) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    return params.get(param);
}

// Function to get location data from the API
async function getLocationData(query) {
    const apiUrl = `https://v6.bvg.transport.rest/locations?query=${query}&fuzzy=true&results=1&stops=true&addresses=true&poi=true&linesOfStops=false&language=de`;
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
    // Extract 'location' query parameter from URL
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