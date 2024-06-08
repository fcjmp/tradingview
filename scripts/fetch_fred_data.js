const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.FRED_API_KEY;
const seriesId = 'UNRATE';  // Change this to the series ID you're interested in
const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

axios.get(url)
  .then(response => {
    const observations = response.data.observations;
    const csvData = observations.map(obs => `${obs.date},${obs.value}`).join('\n');
    fs.writeFileSync(path.join(__dirname, '../data', `${seriesId}.csv`), `Date,Value\n${csvData}`);
    console.log('Data fetched and saved successfully.');
  })
  .catch(error => {
    console.error('Failed to fetch data:', error);
  });
