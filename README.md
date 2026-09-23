# WeatherAPI
A personal weather web application built with **Python, Flask, JavaScript, HTML, and CSS**, using the **Open-Meteo API** to retrieve weather data.

This project is being developed as a personal learning project to practise working with APIs, backend development, frontend JavaScript, and building a responsive web interface.

## Features

### Current Weather

The application currently displays:

- Current temperature
- Feels-like / apparent temperature
- Weather condition
- Day / night status
- Current date
- Current time
- Location

Weather conditions are determined using the **WMO weather codes** provided by Open-Meteo.

### Weather Details

The application also retrieves and displays:

- Sunrise time
- Sunset time
- Today's minimum temperature
- Today's maximum temperature

### Weather Icons

Weather icons are dynamically selected based on the weather code.

For example:

- ☀️ Clear sky
- 🌤️ Mainly clear
- ⛅ Partly cloudy
- ☁️ Overcast
- 🌧️ Rain
- ⛈️ Thunderstorm
- 🌫️ Fog
- ❄️ Snow 

The day/night state is also taken into account when displaying appropriate icons.

### Tomorrow / Hourly Forecast

The UI includes a section for displaying tomorrow's hourly forecast.

The project is currently being developed further to dynamically populate the hourly forecast data.

---

## Technologies Used

### Backend

- **Python**
- **Flask**
- **Open-Meteo API**

### Frontend

- **HTML5**
- **CSS3**
- **JavaScript**

### Development Tools

- Git
- GitHub
- VS Code

---

## API

This project uses the [Open-Meteo API](https://open-meteo.com/) to retrieve weather information.

The API provides:

- Current weather
- Hourly forecasts
- Daily forecasts
- Temperature
- Apparent temperature
- Rain / precipitation
- Humidity
- Sunrise and sunset
- Weather codes

The application uses the following Open-Meteo concepts:

current
hourly
daily

## Project Status

Work in progress

Future Improvements:
- Complete hourly forecast
- Add sunrise and sunset
- Add minimum and maximum temperature
- Add humidity and wind information
- Add location search
- Improve error handling
- Deploy the application
