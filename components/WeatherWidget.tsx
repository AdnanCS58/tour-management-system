"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiCloud,
  FiCloudRain,
  FiSun,
  FiWind,
  FiDroplet,
  FiThermometer,
} from "react-icons/fi";

interface WeatherWidgetProps {
  destination: string;
}

export default function WeatherWidget({ destination }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (destination) {
      fetchWeather();
    }
  }, [destination]);

  const fetchWeather = async () => {
    try {
      const res = await fetch(
        `/api/weather?city=${encodeURIComponent(destination)}`,
      );
      const data = await res.json();

      if (res.ok) {
        setWeather(data);
      } else {
        setError(data.error || "Failed to load weather");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError("Failed to load weather");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode?.includes("01"))
      return <FiSun className="w-8 h-8 text-yellow-400" />;
    if (iconCode?.includes("02"))
      return <FiCloud className="w-8 h-8 text-[#a0b0a8]" />;
    if (iconCode?.includes("09") || iconCode?.includes("10"))
      return <FiCloudRain className="w-8 h-8 text-blue-400" />;
    return <FiCloud className="w-8 h-8 text-[#a0b0a8]" />;
  };

  if (loading) {
    return (
      <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
        <p className="text-[#6b7a72] text-center">
          Weather information unavailable
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl"
    >
      <h3 className="text-lg font-semibold text-[#e8f0eb] mb-4">
        Weather in {weather.current.city}
      </h3>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {getWeatherIcon(weather.current.icon)}
          <div>
            <p className="text-3xl font-bold text-[#e8f0eb]">
              {Math.round(weather.current.temp)}°C
            </p>
            <p className="text-[#a0b0a8] capitalize">
              {weather.current.description}
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-[#6b7a72]">
          <p className="flex items-center justify-end">
            <FiThermometer className="mr-1" />
            Feels like {Math.round(weather.current.feelsLike)}°C
          </p>
          <p className="flex items-center justify-end mt-1">
            <FiDroplet className="mr-1" />
            {weather.current.humidity}% humidity
          </p>
          <p className="flex items-center justify-end mt-1">
            <FiWind className="mr-1" />
            {weather.current.windSpeed} m/s
          </p>
        </div>
      </div>

      {weather.forecast.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#a0b0a8] mb-3">
            Upcoming Forecast
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {weather.forecast.map((forecast: any, index: number) => (
              <div
                key={index}
                className="bg-[#1a211e] rounded-lg p-3 text-center"
              >
                <p className="text-xs text-[#6b7a72]">
                  {new Date(forecast.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
                {getWeatherIcon(forecast.icon)}
                <p className="text-sm font-semibold text-[#e8f0eb] mt-1">
                  {Math.round(forecast.temp)}°C
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
