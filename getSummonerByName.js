const API_KEY = require("./api");
const getURL = require('./url_get');
const getSummonerByName = (summoner)=>{
    const eID_URL = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
            summoner + "?api_key=" + API_KEY;
    const userInfo = getURL(eID_URL);
    return new Promise((resolve, reject) => {
        userInfo.then((user) => {
            resolve(user);
        }).catch(err => {
            reject(err);
        });
    });
}
module.exports = getSummonerByName;