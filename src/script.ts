interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}

interface ForecastResponse {
  current: CurrentWeather;
}

const form = document.querySelector("#weather-form");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status");
const getWeatherbtn = document.querySelector("#get-weather");

if (
  !(form instanceof HTMLFormElement) ||
  !(cityInput instanceof HTMLInputElement) ||
  !(statusMessage instanceof HTMLParagraphElement) ||
  !(getWeatherbtn instanceof HTMLButtonElement)
) {
  throw new Error("Missing expected page elements");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    statusMessage.textContent = "Please enter a city";
    return;
  }

  statusMessage.textContent = "";
  getWeatherbtn.disabled = true;
  statusMessage.textContent = "Loading weather data...";
  // Your next step goes here

  try {
    const encodedCity = encodeURIComponent(city);

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=1`;

    const response = await fetch(url);

    if(!response.ok){
      throw new Error("Fail to find city");
    }

    const data = (await response.json()) as GeocodingResponse;

    if (!data.results || data.results.length === 0) {
      statusMessage.textContent = "City not found. Please try another city";
      return;
    }

    const cityData = data.results[0];
    const cityName = cityData.name;
    const latitude = cityData.latitude;
    const longitude = cityData.longitude;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const weatherData = (await weatherResponse.json()) as ForecastResponse;

    const temperature = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;
    const windSpeed = weatherData.current.wind_speed_10m;
    const weatherCode = weatherData.current.weather_code;

    console.log("Weather Code:", weatherCode);

    let weatherEmoji = "";

    if (weatherCode === 0) {
      weatherEmoji = "☀️";
    } else if (weatherCode === 3) {
      weatherEmoji = "☁️";
    } else if (weatherCode === 80) {
      weatherEmoji = "🌧️";
    } else if (weatherCode === 2) {
      weatherEmoji = "⛅";
    } else if (weatherCode === 95) {
      weatherEmoji = "⛈️";
    } else {
      weatherEmoji = "🌡️";
    }

    statusMessage.textContent = `${weatherEmoji} ${cityName} | Temperature: ${temperature}°C | Humidity: ${humidity}% | Wind speed: ${windSpeed} km/h`;

    console.log(data);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Somthing went wrong. Please try again";
  } finally {
    getWeatherbtn.disabled = false;
  }
});
