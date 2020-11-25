const API_KEY = require("./api");
const getURL = require('./url_get');
const champions = require("./public/champions.json");
const getMatchList = (summoner, champion) => {
    var matchURL = "https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" +
        summoner.accountId + "?";
    if (champion) {
        if (!(champion in champions.data)) {
            return Promise.reject(new Error("No such champions."));
        }
        matchURL += "champion=";
        matchURL += champions.data[champion].key;
        matchURL += ("&api_key=" + API_KEY);
    } else {
        matchURL += ("api_key=" + API_KEY);
    }
    const matches = getURL(matchURL);
    return new Promise((resolve, reject) => {
        matches.then((matchRecords) => {
            resolve(matchRecords);
        }).catch((err) => {
            
            if (err.message.endsWith("404")) {
                console.log("Empty Match Records.");
                resolve("");
            } else {
                console.log("Error from getting the match list.");
                reject(err);
            }
            
        })
    });
};
module.exports = getMatchList;