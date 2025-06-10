// logger.js
const express = require('express');
const cors = require('cors');

const allowedOrigins = ['http://localhost:8080'];
const allowedOriginRegexes = [
  /^https?:\/\/([a-z0-9-]+\.)?mta\.info(:\d+)?$/,
  /^https?:\/\/([a-z0-9-]+\.)?obanyc\.com(:\d+)?$/
];


const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin || allowedOrigins.includes(origin)||
      allowedOriginRegexes.some(regex => regex.test(origin))
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


app.use(express.json());

app.post('/analytics', (req, res) => {
  console.log('Analytics hit:', req.body);
  res.status(204).end();
});

app.listen(8081, () => {
  console.log('Analytics logger running on port 8081');
});

