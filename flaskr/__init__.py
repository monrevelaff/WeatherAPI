import os
import openmeteo_requests
import requests_cache
from retry_requests import retry

from flask import Flask, render_template, jsonify

def create_app(test_config=None):

    # Setup the Open-Meteo API client with cache and retry on error
    cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
    retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
    openmeteo = openmeteo_requests.Client(session = retry_session)

    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)


    @app.route('/')
    def home():
        return render_template('index.html')


    # route to the weather main page
    @app.route('/api/weather')
    def weather():
        # Make sure all required weather variables are listed here
        # The order of variables in hourly or daily is important to assign them correctly below
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": 2.7297,
            "longitude": 101.9381,
            "daily": ["sunrise", "sunset", "temperature_2m_max", "temperature_2m_min"],
            "hourly": ["temperature_2m", "rain"],
            "models": "dwd_icon_seamless",
            "current": ["relative_humidity_2m", "temperature_2m", "is_day", "weather_code", "apparent_temperature"],
            "timezone": "Asia/Singapore",
            "forecast_days": 1,
        }
        responses = openmeteo.weather_api(url, params = params)

        # Process first location. Add a for-loop for multiple locations or weather models
        response = responses[0]

        # Process current data. The order of variables needs to be the same as requested.
        current = response.Current()
        current_relative_humidity_2m = current.Variables(0).Value()
        current_temperature_2m = current.Variables(1).Value()
        current_is_day = current.Variables(2).Value()
        current_weather_code = current.Variables(3).Value()
        current_apparent_temperature = current.Variables(4).Value()

        # Process daily data. The order of variables needs to be the same as requested.
        daily = response.Daily()
        daily_sunrise = daily.Variables(0).Values(0)
        daily_sunset = daily.Variables(1).Values(0)
        daily_temperature_2m_max = daily.Variables(2).Values(0)
        daily_temperature_2m_min = daily.Variables(3).Values(0)

        return jsonify({
            "current_time": current.Time(), 
            "relative_humidity_2m": current_relative_humidity_2m,
            "temperature_2m": current_temperature_2m,
            "is_day": current_is_day,
            "weather_code": current_weather_code,
            "apparent_temperature": current_apparent_temperature,
            "sunrise": daily_sunrise,
            "sunset": daily_sunset,
            "temperature_2m_max": daily_temperature_2m_max,
            "temperature_2m_min": daily_temperature_2m_min
        })

    return app
    