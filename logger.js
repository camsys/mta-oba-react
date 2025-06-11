// logger.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const allowedOrigins = ['http://localhost:8080'];
const allowedOriginRegexes = [
  /^https?:\/\/([a-z0-9-]+\.)?mta\.info(:\d+)?$/,
  /^https?:\/\/([a-z0-9-]+\.)?obanyc\.com(:\d+)?$/
];


process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

const app = express();

// app.use(cors({
//   origin: (origin, callback) => {
//     if (
//       !origin || allowedOrigins.includes(origin)||
//       allowedOriginRegexes.some(regex => regex.test(origin))
//     ) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

// nginx will handle CORS, so we can skip it here for now at least
app.use(cors());

app.use(express.json());


function getTimestampFilename() {
  const now = new Date();
  const minute = now.toISOString().slice(0, 16).replace(/[:]/g, '-'); // YYYY-MM-DDTHH-MM
  const [_, nanos] = process.hrtime();
  const micros = String(Math.floor(nanos / 1000)).padStart(6, '0');
  return `analytics-${minute}-Z-${micros}.log`;
}

let currentStream = null;
let currentMinute = null;

function rotateLogFile() {
  const now = new Date();
  const minuteKey = now.toISOString().slice(0, 16); // up to minute
  if (currentMinute !== minuteKey) {
    currentMinute = minuteKey;
    const filename = getTimestampFilename();
    const filepath = path.join('/var','log', 'ui', filename);
    newStream = fs.createWriteStream(filepath, { flags: 'a' });
    if (currentStream) currentStream.end();
    currentStream = newStream;
    console.log('Rotated log file to:', filename);
  }
}

app.post('/analytics', (req, res) => {
  try {
    const bodyString = JSON.stringify(req.body);
    if (bodyString.length > 20000) {
      return res.status(413).send('Payload too large');
    }

    rotateLogFile();  // ensure stream is up to date

    const logEntry = `${new Date().toISOString()} ${bodyString}\n`;
    currentStream.write(logEntry);

    res.status(204).end();
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});


app.listen(8081, () => {
  console.log('Analytics logger running on port 8081');
});

