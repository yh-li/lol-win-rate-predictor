const getURL = require("./url_get");


function winrate(matchList, user) {
    const matchObjects = matchList.matches;
    const matchPromises = [];
    if (matchObjects) {
        matchObjects.forEach((match) => {
            const matchURL = "https://na1.api.riotgames.com/lol/match/v4/matches/" + String(match.gameId) + "?api_key=" + API_KEY;
            const matchPromise = getURL(matchURL);
            matchPromises.push(matchPromise);
        }); 
        
    }
    return Promise.all(matchPromises).then((matches) => {
        var games = 0;
        var wins = 0;
        matches.forEach((match) => {
            if (match.participantIdentities) {
                const participants = match.participantIdentities;
                participants.forEach((participant) => {
                    //get team id of this summoner by participant id
                    if (participant.player.summonerName === user.name) {
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
                        if (match.teams[team].win === "Win") {
                            wins++;
                            games++;
                            //console.log("win");
                        } else {
                            games++;
                            //console.log("lose");
                        }
                    }
                    
                });

            }
            
        });
        return wins / games;
    }).catch((err) => {
        console.log("Error during solving all promises of getting matches.");
        console.log(err);
    });

}

module.exports = winrate;