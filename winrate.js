const { response } = require("express");
const https = require("https"); 


function winrate(matches, api_key, summoner) {
    //an innder function to send the http request
    //returns a promise
    function checkMatchRecord(matchId) {
        const matchURL = "https://na1.api.riotgames.com/lol/match/v4/matches/" + matchId + "?api_key=" + api_key;
        return new Promise((resolve, reject) => {
            //when will we reject this promise?
            https.get(matchURL, (response) => {
                if (response.statusCode !== 200) {
                    resolve([0,-1]);
                } else {
                    //we resolve this promise
                    //either with 1 or 0
                    const matchDataChunks = []
                    response.on("data", (data) => {
                        matchDataChunks.push(data);
                    }).on("end", () => {
                        const matchJSON = JSON.parse(Buffer.concat(matchDataChunks));
                        const participants = matchJSON.participantIdentities;
                        //get participant id of this summoner
                        participants.forEach((participant) => {
                            //get team id of this summoner by participant id
                            if (participant.player.summonerName === summoner) {
                                var team;
                                //check if it's team 1 or 2
                                if (Number(participant.participantId) > 5) {
                                    //team 200
                                    //console.log("200");
                                    team = 1;
                                } else {
                                    //console.log("100");
                                    team = 0;
                                }
                                //see if win
                                if (matchJSON.teams[team].win === "Win") {
                                    resolve([1,0]);
                                    //console.log("win");
                                } else {
                                    resolve([0,0]);
                                    //console.log("lose");
                                }
    
                            }
                            
                        });
                    });
                }
                
            });
        });
    }
    //create an array of promises
    const matchPromises = [];
    matches.forEach((match) => {
        const p = checkMatchRecord(match.gameId);
        matchPromises.push(p);
    });
    return matchPromises;
}

module.exports = winrate;