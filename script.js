
// Get HTML elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const detailTemperature = document.getElementById("detailTemperature");
const humidity = document.getElementById("humidity");
const weatherCondition = document.getElementById("weatherCondition");
const weatherIcon = document.getElementById("weatherIcon");

const errorMessage = document.getElementById("errorMessage");

// Search button functionality
searchBtn.addEventListener("click", getWeather);

// Enter key functionality
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

// Main weather function
async function getWeather() {

    const city = cityInput.value.trim();

    // Validate input
    if (city === "") {
        errorMessage.textContent = "Please enter a city name!";
        return;
    }

    errorMessage.textContent = "";
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";

    try {

        let location;

        const normalizedCity = city
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

        // Special location 1: Pulivendula
        if (
            normalizedCity === "pulivendula" ||
            normalizedCity === "pulivendla" ||
            normalizedCity.startsWith("pulivendula,")
        ) {

            location = {
                name: "Pulivendula",
                country: "India",
                latitude: 14.41944,
                longitude: 78.22500
            };

        }

        // Special location 2: HSR Layout
        else if (
            normalizedCity === "hsr layout" ||
            normalizedCity === "hsr layout, bengaluru" ||
            normalizedCity === "hsr layout, bangalore"
        ) {

            location = {
                name: "HSR Layout, Bengaluru",
                country: "India",
                latitude: 12.91162,
                longitude: 77.63886
            };

        }

        // Search all other cities using Geocoding API
        else {

            const geoURL =
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json&countryCode=IN`;

            const geoResponse = await fetch(geoURL);

            if (!geoResponse.ok) {
                throw new Error("Unable to search for this city.");
            }

            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error(
                    "City not found! Please check the spelling."
                );
            }

            // Find exact matching city if available
            const searchName = normalizedCity.split(",")[0].trim();

            location = geoData.results.find(function(place) {
                return place.name.toLowerCase() === searchName;
            }) || geoData.results[0];

        }

        // Fetch weather data
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        // Display city name
        cityName.textContent =
            location.name + ", " + location.country;

        // Display temperature
        temperature.textContent =
            current.temperature_2m + "°C";

        detailTemperature.textContent =
            current.temperature_2m + "°C";

        // Display humidity
        humidity.textContent =
            current.relative_humidity_2m + "%";

        // Display weather condition
        displayWeatherCondition(current.weather_code);

    } catch (error) {

        errorMessage.textContent = error.message;

    } finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

    }
}

// Weather condition and icon
function displayWeatherCondition(code) {

    let condition = "";
    let icon = "";

    if (code === 0) {
        condition = "Clear Sky";
        icon = "☀️";
    }

    else if ([1, 2, 3].includes(code)) {
        condition = "Partly Cloudy";
        icon = "🌤️";
    }

    else if ([45, 48].includes(code)) {
        condition = "Foggy";
        icon = "🌫️";
    }

    else if ([51, 53, 55, 56, 57].includes(code)) {
        condition = "Drizzle";
        icon = "🌦️";
    }

    else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        condition = "Rainy";
        icon = "🌧️";
    }

    else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        condition = "Snowy";
        icon = "❄️";
    }

    else if ([95, 96, 99].includes(code)) {
        condition = "Thunderstorm";
        icon = "⛈️";
    }

    else {
        condition = "Unknown Weather";
        icon = "🌡️";
    }

    weatherCondition.textContent = condition;
    weatherIcon.textContent = icon;
}
