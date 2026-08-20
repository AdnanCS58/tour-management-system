import { NextRequest, NextResponse } from 'next/server';

// Using OpenWeatherMap API (free tier)
// You'll need to sign up at https://openweathermap.org/api to get an API key

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    
    if (!city) {
      return NextResponse.json({ error: 'Please provide a city' }, { status: 400 });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
    
    // Get current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    
    if (!weatherRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch weather' }, { status: weatherRes.status });
    }

    const weatherData = await weatherRes.json();

    // Get 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    
    const forecastData = await forecastRes.ok ? await forecastRes.json() : null;

    return NextResponse.json({
      current: {
        temp: weatherData.main?.temp,
        feelsLike: weatherData.main?.feels_like,
        humidity: weatherData.main?.humidity,
        description: weatherData.weather?.[0]?.description,
        icon: weatherData.weather?.[0]?.icon,
        windSpeed: weatherData.wind?.speed,
        city: weatherData.name,
        country: weatherData.sys?.country,
      },
      forecast: forecastData?.list?.slice(0, 8).map((item: any) => ({
        time: item.dt_txt,
        temp: item.main?.temp,
        description: item.weather?.[0]?.description,
        icon: item.weather?.[0]?.icon,
      })) || [],
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather' },
      { status: 500 }
    );
  }
}