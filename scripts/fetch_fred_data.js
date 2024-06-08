const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const seriesIDs = ['UNRATE', 'CPIAUCSL', 'FYGDP']; // Add more series IDs as needed
const apiKey = process.env.FRED_API_KEY;
const retryDelay = 6000; // Retry timeout in milliseconds (60 seconds)
const maxRetries = 3;

async function fetchSeriesData(seriesId) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.get(url);
            const observations = response.data.observations;
            const csvData = `Date,Value\n${observations.map(obs => `${obs.date},${obs.value}`).join('\n')}`;
            fs.writeFileSync(path.join(__dirname, '../data', `${seriesId.toLowerCase()}.csv`), csvData);
            console.log(`${seriesId} data fetched and saved successfully.`);
            break; // Break the loop if data is fetched successfully
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${seriesId}: ${error.message}`);
            if (attempt === maxRetries) {
                console.error(`Failed to fetch data for ${seriesId} after ${maxRetries} attempts.`);
            } else {
                console.log(`Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
}

async function fetchAllSeries() {
    for (const seriesId of seriesIDs) {
        await fetchSeriesData(seriesId);
    }
}

fetchAllSeries()
    .then(() => console.log('All series processed successfully.'))
    .catch(error => console.error('An error occurred during fetching: ', error))
    .finally(() => console.log('Fetching process completed.'));
