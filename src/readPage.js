const axios = require('axios');

module.exports = {
    async getUrl(url) {
        const res = await axios.get(url);
        return res.data;
    }
}