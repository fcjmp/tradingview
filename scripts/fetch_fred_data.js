require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.FRED_API_KEY;
const seriesId = 'UNRATE';  // Example: Unemployment Rate
const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

axios.get(url)
  .then(response => {
    const data = response.data;
    const csvData = convertToCSV(data.observations);
    fs.writeFileSync(path.join(__dirname, 'data', `${seriesId}.csv`), csvData);
    console.log('Data fetched and saved successfully.');
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

function convertToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = 'Date,Value\n';

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const index in array[i]) {
      if (line !== '') line += ','
      line += array[i][index];
    }
    str += line + '\r\n';
  }
  return str;
}
