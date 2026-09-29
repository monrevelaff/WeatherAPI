// full WMO weather-code mapping from Open-Meteo
function getWeatherDescription(code) {
    if (code === 0) {
        return 'Clear Sky';
    } else if (code === 1) {
        return 'Mainly Clear';
    } else if (code === 2) {
        return 'Partly Cloudy';
    } else if (code === 3) {
        return 'Overcast';
    } else if (code === 45) {
        return 'Fog';
    } else if (code === 48) {
        return 'Depositing Rime Fog';
    } else if (code === 51) {
        return 'Light Drizzle';
    } else if (code === 53) {
        return 'Moderate Drizzle';
    } else if (code === 55) {
        return 'Dense Drizzle';
    } else if (code === 56) {
        return 'Light Freezing Drizzle';
    } else if (code === 57) {
        return 'Dense Freezing Drizzle';
    } else if (code === 61) {
        return 'Slight Rain';
    } else if (code === 63) {
        return 'Moderate Rain';
    } else if (code === 65) {
        return 'Heavy Rain';
    } else if (code === 66) {
        return 'Light Freezing Rain';
    } else if (code === 67) {
        return 'Heavy Freezing Rain';
    } else if (code === 71) {
        return 'Slight Snow';
    } else if (code === 73) {
        return 'Moderate Snow';
    } else if (code === 75) {
        return 'Heavy Snow';
    } else if (code === 77) {
        return 'Snow Grains';
    } else if (code === 80) {
        return 'Slight Rain Showers';
    } else if (code === 81) {
        return 'Moderate Rain Showers';
    } else if (code === 82) {
        return 'Heavy Rain Showers';
    } else if (code === 85) {
        return 'Slight Snow Showers';
    } else if (code === 86) {
        return 'Heavy Snow Showers';
    } else if (code === 95) {
        return 'Thunderstorm';
    } else if (code === 96 || code === 99) {
        return 'Thunderstorm with Hail';
    } else {
        return 'Unknown';
    }
}

function getDayNight(isDay) {
    if (isDay === 1) {
        return 'Day';
    } else {
        return 'Night';
    }
}

function getWeatherIcon(code, isDay) {

    if (code === 0) {
        return isDay === 1 ? 'wi-day-sunny' : 'wi-night-clear';

    } else if (code === 1) {
        return isDay === 1 ? 'wi-day-sunny-overcast' : 'wi-night-alt-cloudy';

    } else if (code === 2) {
        return isDay === 1 ? 'wi-day-cloudy' : 'wi-night-alt-cloudy';

    } else if (code === 3) {
        return 'wi-cloudy';

    } else if (code === 45 || code === 48) {
        return 'wi-fog';

    } else if (code >= 51 && code <= 53) {
        return 'wi-sprinkle';

    } else if (code === 55) {
        return 'wi-rain';

    } else if (code === 56 || code === 57) {
        return 'wi-sleet';

    } else if (code >= 61 && code <= 65) {
        return 'wi-rain';

    } else if (code === 66 || code === 67) {
        return 'wi-rain-mix';

    } else if (code >= 71 && code <= 77) {
        return 'wi-snow';

    } else if (code >= 80 && code <= 82) {
        return 'wi-showers';

    } else if (code === 85 || code === 86) {
        return 'wi-snow';

    } else if (code === 95) {
        return 'wi-thunderstorm';

    } else if (code === 96 || code === 99) {
        return 'wi-hail';

    } else {
        return 'wi-na';
    }
}

fetch('/api/weather')
    .then(response => response.json())
    .then(data => {

        // Date and current time based on the timezone from the API response
        const now = new Date();
        const timezone = data.timezone;

        const date = now.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            timeZone: timezone
        });

        const time = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone
        });

        document.getElementById('date').textContent =
            `Today, ${date}`;

        document.getElementById('current-time').textContent =
            `Current Time ${time}`;


        const description = getWeatherDescription(data.weather_code);
        const dayNight = getDayNight(data.is_day);
        const icon = getWeatherIcon(data.weather_code, data.is_day);

        console.log(data.weather_code);
        console.log(data.is_day);

        document.getElementById('weather-icon').className = `wi ${icon}`;
        document.getElementById('weather-condition').textContent = description;
        document.getElementById('day-night').textContent = dayNight;
        document.getElementById('temperature').textContent = data.temperature_2m.toFixed(0);  
        document.getElementById('apparent-temperature').textContent = 
        data.apparent_temperature.toFixed(0);
       
        // Update daily details
        const sunriseTime = new Date(data.sunrise);
        const sunsetTime = new Date(data.sunset);
        const sunriseFormatted = sunriseTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const sunsetFormatted = sunsetTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        document.getElementById('sunrise').textContent = sunriseFormatted;
        document.getElementById('sunset').textContent = sunsetFormatted;
        document.getElementById('max-temp').textContent = data.temperature_2m_max.toFixed(0);
        document.getElementById('min-temp').textContent = data.temperature_2m_min.toFixed(0);

        // Update hourly forecast
        const hourlyTimes = data.hourly_time;
        const hourlyTemperatures = data.hourly_temperature_2m;
        const hourlyPrecipitation = data.hourly_precipitation_probability;
        const hourlyWeatherCodes = data.hourly_weather_code;

        const selectedHourlyData = hourlyTimes.map((time, index) => ({
            time: time,
            temperature: hourlyTemperatures[index],
            precipitation: hourlyPrecipitation[index],
            weatherCode: hourlyWeatherCodes[index]
        })).filter((item, index) => index % 3 === 0).slice(0, 9); // Select every 3rd hour

        // Display hourly forecast
        const hourlyContainer = document.getElementById('hourly-forecast');

        hourlyContainer.innerHTML = '';

        selectedHourlyData.forEach(item => {

            const forecastDate = new Date(item.time);
            // Format forecast hour
            const forecastHour =
                forecastDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true
                });

            // Check if the forecast hour is for the next day (12 AM)

            const isNextDay =
                forecastDate.getHours() === 0 &&
                (
                    forecastDate.getFullYear() !== now.getFullYear() ||
                    forecastDate.getMonth() !== now.getMonth() ||
                    forecastDate.getDate() !== now.getDate()
                );


            // Format tomorrow's date,
            const nextDayDate =
                forecastDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                });

            // Determine day/night icon

            let hourlyIsDay;

            if (isNextDay) {

                // The only next-day forecast displayed
                // is 12 AM, so it is nighttime.
                hourlyIsDay = 0;

            } else {

                // For today's forecast, compare the
                // forecast time with today's sunrise
                // and sunset.
                hourlyIsDay =
                    forecastDate >= sunriseTime &&
                    forecastDate < sunsetTime
                        ? 1
                        : 0;
            }

            const iconClass =
                getWeatherIcon(
                    item.weatherCode,
                    hourlyIsDay
                );

            const hourlyCard = document.createElement('div');
            hourlyCard.className = 'hour';

            hourlyCard.innerHTML = `
                <span class="hour-time">
                    ${forecastHour}
                    ${isNextDay ? `<small>${nextDayDate}</small>` : ''}
                </span>

                <i class="wi ${iconClass} hour-icon"></i>

                <span class="hour-temp">
                    ${item.temperature.toFixed(0)}°
                </span>

                <span class="hour-rain">
                    <i class="wi wi-raindrop"></i>
                    ${item.precipitation}%
                </span>
            `;

            hourlyContainer.appendChild(hourlyCard);
        });
    });