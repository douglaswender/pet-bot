const axios = require('axios');

module.exports = {
    async getUrl(url) {
        const res = await axios.get(url);
        console.log(res);
        return res.data;
    }
}