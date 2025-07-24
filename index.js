require('dotenv').config();
console.log('API Key:', process.env.OPENWEATHER_API_KEY);
const puppeteer = require('puppeteer');
const axios = require('axios');

async function getWeatherForecast(city) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    // response.data.list contains forecast every 3 hours for 5 days
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return null;
  }
}

(async () => {
  // Step 1: Fetch weather forecast first
  console.log('Fetching weather forecast for Tel Aviv...');
  const forecast = await getWeatherForecast('Tel Aviv');
  if (!forecast) {
    console.log('Failed to get weather data, exiting...');
    return;
  }

  // Example: check if rain is forecasted in next 24 hours
  const nextDayForecasts = forecast.list.slice(0, 8); // 8 x 3hr = 24hr
  const rainExpected = nextDayForecasts.some(item => item.weather.some(w => w.main.toLowerCase().includes('rain')));
  console.log('Rain expected in next 24 hours:', rainExpected);

  // Decide moisture threshold based on rain forecast (example)
  const moistureThreshold = rainExpected ? 300 : 600;
  console.log('Setting moisture sensor threshold to:', moistureThreshold);

  // Step 2: Start Puppeteer automation
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to Tinkercad login page...');
  await page.goto('https://www.tinkercad.com/login');

  console.log('Filling in email...');
  await page.type('input[name="email"]', process.env.TINKERCAD_EMAIL);

  console.log('Filling in password...');
  await page.type('input[name="password"]', process.env.TINKERCAD_PASSWORD);

  console.log('Submitting login form...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  console.log('Login successful, navigating to project page...');
  // Replace with your actual project ID
  await page.goto('https://www.tinkercad.com/things/AbCdEf12345-glorious-allis');

  console.log('Project page loaded.');

  // You can now use moistureThreshold in your automation as needed
  // For example, send this value to your Arduino or set it in your app logic

  // await browser.close();
  console.log('Script finished.');
})();
