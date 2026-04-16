"""Wildfire spread prediction models."""
import numpy as np
import math
from typing import List, Tuple, Dict
from datetime import datetime, timedelta
import json


class WildfireSpreadModel:
    """
    Simplified wildfire spread model based on Rothermel equations.
    Incorporates weather data and crowd-sourced observations.
    """

    def __init__(self):
        # Model parameters (simplified)
        self.fuel_load = 1.0  # kg/m^2
        self.fuel_moisture = 0.1  # 10% moisture content
        self.slope_factor = 1.0

    def calculate_rate_of_spread(
        self,
        wind_speed: float,
        wind_direction: float,
        temperature: float,
        humidity: float
    ) -> float:
        """
        Calculate rate of spread in meters/hour using simplified Rothermel model.

        Args:
            wind_speed: Wind speed in km/h
            wind_direction: Wind direction in degrees
            temperature: Temperature in Celsius
            humidity: Relative humidity as percentage

        Returns:
            Rate of spread in meters/hour
        """
        # Convert wind speed to m/s
        wind_ms = wind_speed * 1000 / 3600

        # Base rate of spread (without wind)
        base_ros = 10.0  # m/hour

        # Wind effect (exponential relationship)
        wind_factor = 1 + (wind_ms * 0.5)

        # Temperature effect (higher temp = faster spread)
        temp_factor = 1 + ((temperature - 20) * 0.02)

        # Humidity effect (lower humidity = faster spread)
        humidity_factor = 1 + ((50 - humidity) * 0.01)

        # Moisture effect
        moisture_factor = 1 / (1 + self.fuel_moisture * 2)

        # Combined rate of spread
        ros = base_ros * wind_factor * temp_factor * humidity_factor * moisture_factor

        return max(ros, 5.0)  # Minimum 5 m/hour

    def predict_spread_polygon(
        self,
        center_lat: float,
        center_lon: float,
        wind_speed: float,
        wind_direction: float,
        temperature: float,
        humidity: float,
        hours_ahead: int,
        crowd_reports: List[Dict] = None
    ) -> Dict:
        """
        Predict fire spread as a polygon over time.

        Args:
            center_lat: Center latitude of fire
            center_lon: Center longitude of fire
            wind_speed: Wind speed in km/h
            wind_direction: Wind direction in degrees (meteorological)
            temperature: Temperature in Celsius
            humidity: Relative humidity percentage
            hours_ahead: Hours to predict into the future
            crowd_reports: List of crowd-sourced reports with lat/lon

        Returns:
            GeoJSON-compatible polygon dictionary
        """
        # Calculate rate of spread
        ros = self.calculate_rate_of_spread(wind_speed, wind_direction, temperature, humidity)

        # Total spread distance in meters
        total_spread_m = ros * hours_ahead

        # Apply crowd-sourced data to adjust prediction
        if crowd_reports:
            adjustment_factor = self._analyze_crowd_reports(
                center_lat, center_lon, crowd_reports, total_spread_m
            )
            total_spread_m *= adjustment_factor

        # Convert meters to approximate degrees (rough approximation)
        # 1 degree latitude ≈ 111km
        spread_deg = total_spread_m / 111000

        # Create elliptical spread pattern (wind creates elongation)
        # Wind direction in radians (convert from meteorological to mathematical)
        wind_rad = math.radians((270 - wind_direction) % 360)

        # Ellipse parameters: elongated in wind direction
        major_axis = spread_deg * 1.5  # Elongated in wind direction
        minor_axis = spread_deg * 0.7  # Narrower perpendicular to wind

        # Generate polygon points (ellipse)
        num_points = 32
        coordinates = []

        for i in range(num_points + 1):
            angle = (2 * math.pi * i) / num_points

            # Ellipse equation
            x = major_axis * math.cos(angle)
            y = minor_axis * math.sin(angle)

            # Rotate by wind direction
            x_rot = x * math.cos(wind_rad) - y * math.sin(wind_rad)
            y_rot = x * math.sin(wind_rad) + y * math.cos(wind_rad)

            # Convert to lat/lon
            lat = center_lat + y_rot
            lon = center_lon + (x_rot / math.cos(math.radians(center_lat)))

            coordinates.append([lon, lat])

        # Create GeoJSON polygon
        geojson = {
            "type": "Polygon",
            "coordinates": [coordinates],
            "properties": {
                "rate_of_spread_m_per_hour": ros,
                "total_spread_meters": total_spread_m,
                "prediction_hours": hours_ahead
            }
        }

        return geojson

    def _analyze_crowd_reports(
        self,
        center_lat: float,
        center_lon: float,
        crowd_reports: List[Dict],
        predicted_spread: float
    ) -> float:
        """
        Analyze crowd-sourced reports to adjust prediction confidence.

        Returns:
            Adjustment factor (0.5 to 1.5) to apply to spread prediction
        """
        if not crowd_reports:
            return 1.0

        # Calculate distances of reports from center
        distances = []
        for report in crowd_reports:
            dist = self._haversine_distance(
                center_lat, center_lon,
                report['latitude'], report['longitude']
            )
            distances.append(dist)

        if not distances:
            return 1.0

        # If reports are farther than predicted, increase spread
        # If closer, decrease spread
        avg_report_distance = np.mean(distances)

        if avg_report_distance > predicted_spread * 1.2:
            return 1.3  # Fire spreading faster than model predicts
        elif avg_report_distance < predicted_spread * 0.8:
            return 0.9  # Fire spreading slower

        return 1.0  # Reports align with model

    def _haversine_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Calculate great circle distance between two points in meters.
        """
        R = 6371000  # Earth radius in meters

        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (math.sin(delta_phi / 2) ** 2 +
             math.cos(phi1) * math.cos(phi2) *
             math.sin(delta_lambda / 2) ** 2)

        c = 2 * math.asin(math.sqrt(a))

        return R * c


class LightweightFireModel:
    """
    Lightweight model for mobile devices.
    Uses pre-computed lookup tables and simplified calculations.
    """

    def __init__(self):
        # Pre-computed spread rates for common conditions
        self.spread_lookup = self._generate_lookup_table()

    def _generate_lookup_table(self) -> Dict:
        """Generate lookup table for fast predictions."""
        lookup = {}

        # Discretize input space
        for wind in [0, 10, 20, 30, 40]:  # km/h
            for temp in [15, 25, 35, 45]:  # Celsius
                for humidity in [20, 40, 60, 80]:  # %
                    key = f"{wind}_{temp}_{humidity}"

                    # Simplified calculation
                    base = 10.0
                    wind_factor = 1 + (wind * 0.05)
                    temp_factor = 1 + ((temp - 20) * 0.02)
                    humidity_factor = 1 + ((50 - humidity) * 0.01)

                    ros = base * wind_factor * temp_factor * humidity_factor
                    lookup[key] = ros

        return lookup

    def quick_predict(
        self,
        wind_speed: float,
        temperature: float,
        humidity: float,
        hours: int
    ) -> float:
        """
        Quick prediction using lookup table.
        Returns estimated spread radius in meters.
        """
        # Round to nearest lookup values
        wind_key = min([0, 10, 20, 30, 40], key=lambda x: abs(x - wind_speed))
        temp_key = min([15, 25, 35, 45], key=lambda x: abs(x - temperature))
        humidity_key = min([20, 40, 60, 80], key=lambda x: abs(x - humidity))

        key = f"{wind_key}_{temp_key}_{humidity_key}"
        ros = self.spread_lookup.get(key, 15.0)  # Default 15 m/h

        return ros * hours
