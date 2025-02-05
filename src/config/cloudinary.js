const cloudinary = require('cloudinary').v2;
const env = require("./env.js");

cloudinary.config({
    cloud_name: 'dyjhe7cg2',
    api_key: '343737699854672',
    api_secret: 'IYHjgMp8sCl0Qc9K_5HP4V3T03U' // Click 'View API Keys' above to copy your API secret
});

module.exports = cloudinary;