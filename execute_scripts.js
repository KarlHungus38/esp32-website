export async function getCurrentLocation(successCallback, errorCallback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            successCallback(latitude, longitude);
        }, (error) => {
            console.error('Error getting location:', error);
            errorCallback(error);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        errorCallback(new Error('Geolocation is not supported by this browser.'));
    }
}