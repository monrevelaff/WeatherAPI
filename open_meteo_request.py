import openmeteo_requests

import pandas as pd
import requests_cache
from retry_requests import retry

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
url = "https://api.open-meteo.com/v1/forecast"
params = {
	"latitude": 2.7297,
	"longitude": 101.9381,
	"daily": ["sunrise", "sunset", "temperature_2m_max", "temperature_2m_min", "weather_code"],
	"hourly": ["temperature_2m", "rain"],
	"models": "dwd_icon_seamless",
	"current": ["relative_humidity_2m", "temperature_2m", "is_day", "rain", "precipitation", "weather_code"],
	"timezone": "Asia/Singapore",
	"forecast_days": 1,
}
responses = openmeteo.weather_api(url, params = params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]
print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation: {response.Elevation()} m asl")
print(f"Timezone: {response.Timezone()}{response.TimezoneAbbreviation()}")
print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

# Process current data. The order of variables needs to be the same as requested.
current = response.Current()
current_relative_humidity_2m = current.Variables(0).Value()
current_temperature_2m = current.Variables(1).Value()
current_is_day = current.Variables(2).Value()
current_rain = current.Variables(3).Value()
current_precipitation = current.Variables(4).Value()
current_weather_code = current.Variables(5).Value()

print(f"\nCurrent time: {current.Time()}")
print(f"Current relative_humidity_2m: {current_relative_humidity_2m}")
print(f"Current temperature_2m: {current_temperature_2m}")
print(f"Current is_day: {current_is_day}")
print(f"Current rain: {current_rain}")
print(f"Current precipitation: {current_precipitation}")
print(f"Current weather_code: {current_weather_code}")

# Process hourly data. The order of variables needs to be the same as requested.
hourly = response.Hourly()
hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
hourly_rain = hourly.Variables(1).ValuesAsNumpy()

hourly_data = {
	"date": pd.date_range(
		start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
		end =  pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
		freq = pd.Timedelta(seconds = hourly.Interval()),
		inclusive = "left"
	).tz_convert(response.Timezone().decode())
}

hourly_data["temperature_2m"] = hourly_temperature_2m
hourly_data["rain"] = hourly_rain

hourly_dataframe = pd.DataFrame(data = hourly_data)
print("\nHourly data\n", hourly_dataframe)

# Process daily data. The order of variables needs to be the same as requested.
daily = response.Daily()
daily_sunrise = daily.Variables(0).ValuesInt64AsNumpy()
daily_sunset = daily.Variables(1).ValuesInt64AsNumpy()
daily_temperature_2m_max = daily.Variables(2).ValuesAsNumpy()
daily_temperature_2m_min = daily.Variables(3).ValuesAsNumpy()
daily_weather_code = daily.Variables(4).ValuesAsNumpy()

daily_data = {
	"date": pd.date_range(
		start = pd.to_datetime(daily.Time(), unit = "s", utc = True),
		end =  pd.to_datetime(daily.TimeEnd(), unit = "s", utc = True),
		freq = pd.Timedelta(seconds = daily.Interval()),
		inclusive = "left"
	).tz_convert(response.Timezone().decode())
}

daily_data["sunrise"] = pd.to_datetime(daily_sunrise, unit = "s", utc = True).tz_convert(response.Timezone().decode())
daily_data["sunset"] = pd.to_datetime(daily_sunset, unit = "s", utc = True).tz_convert(response.Timezone().decode())
daily_data["temperature_2m_max"] = daily_temperature_2m_max
daily_data["temperature_2m_min"] = daily_temperature_2m_min
daily_data["weather_code"] = daily_weather_code

daily_dataframe = pd.DataFrame(data = daily_data)
print("\nDaily data\n", daily_dataframe)
