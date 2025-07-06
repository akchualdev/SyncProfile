const axios = require('axios');

const API_ENDPOINTS = [
    'https://uidlookupnx.vercel.app/info',
];

const axiosInstance = axios.create({
    timeout: 4000,
    maxRedirects: 1,
    maxContentLength: 3 * 1024 * 1024,
    headers: {
        'User-Agent': 'Ultra-Fast-Bot/1.0',
        'Accept': 'application/json,image/*',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
    },
    validateStatus: status => status < 500,
    decompress: true
});

module.exports = {
    API_ENDPOINTS,
    axiosInstance
};