const { axiosInstance } = require('../config/api');
const { MAX_RETRIES } = require('../config/constants');

async function ultraFastFetch(url, maxRetries = MAX_RETRIES) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axiosInstance.get(url);
            if (response.status === 200) return response;

            if (i === maxRetries - 1) {
                throw new Error(`Status: ${response.status}`);
            }
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
}

module.exports = {
    ultraFastFetch
};
