const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    async getUrl(url) {
        const res = await axios.get(url);
        var $ = cheerio.load(res.data);
        var notes = $('.style__List-sc-3mnuh-2 li a article div div h2').first().text();
        return notes;
    }
}