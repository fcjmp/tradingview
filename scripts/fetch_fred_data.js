const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const seriesInfo = [
    { id: 'UNRATE', description: 'Unemployment Rate', units: 'Percent', category: 'Relative', transformation: 'lin' },
    { id: 'CPIAUCSL', description: 'Consumer Price Index for All Urban Consumers: All Items', units: 'Index 1982-1984=100', category: 'Index', transformation: 'lin' },
    { id: 'FYGDP', description: 'Federal Debt: Total Public Debt as Percent of Gross Domestic Product', units: 'Percent of GDP', category: 'Relative', transformation: 'lin' }
];

const apiKey = process.env.FRED_API_KEY;
const retryDelay = 60000; // Retry timeout in milliseconds (60 seconds)
const maxRetries = 3;

async function fetchSeriesData(series) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${apiKey}&file_type=json`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.get(url);
            const observations = response.data.observations;
            const transformation = response.data.transformation || series.transformation; // Fallback to manually set transformation if not present
            const csvData = `Date,Value,Units,Transformation\n${observations.map(obs => `${obs.date},${obs.value},${series.units},${transformation}`).join('\n')}`;
            fs.writeFileSync(path.join(__dirname, '../data', `${series.id.toLowerCase()}.csv`), csvData);
            console.log(`${series.id} data fetched and saved successfully.`);
            break; // Break the loop if data is fetched successfully
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${series.id}: ${error.message}`);
            if (attempt === maxRetries) {
                console.error(`Failed to fetch data for ${series.id} after ${maxRetries} attempts.`);
            } else {
                console.log(`Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
}

async function fetchAllSeries() {
    for (const series of seriesInfo) {
        await fetchSeriesData(series);
    }
}

fetchAllSeries()
    .then(() => console.log('All series processed successfully.'))
    .catch(error => console.error('An error occurred during fetching: ', error))
    .finally(() => console.log('Fetching process completed.'));
