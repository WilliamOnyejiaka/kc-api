const cors = require('cors');

const origins = [
    // "http://localhost:5500",
    "*"
];

const corsConfig = cors({
    origin: origins,
    // credentials: true
});

module.exports = corsConfig;