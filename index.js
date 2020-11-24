const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser")
const https = require("https");
const app = express();
//get champions
const champions = require("./public/champions.json");
const winrate = require("./winrate");

const API_KEY = require("./api");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");




const checkRecord = (response,req, res) => {
    if (response.statusCode !== 200) {
        //if we couldn't find the summoner
        res.send("Sorry no such summoner...");
    } else {
        //else we found the summoner
        response.on("data", (data) => {
            //there will only be one data parcel
            //when trying to get summoners
            const summoner = JSON.parse(data);
            //we tried to pull all the matches of the summoner
            var matchURL = "https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" +
                summoner.accountId + "?";
            //if there is an input for the champion
            if (req.body.champion) {
                //console.log("The input champion is " + req.body.champion);
                //get champion id
                //get all champions
                //see if the champion is correct
                if (!(req.body.champion in champions.data)) {
                    res.send("No such champions.");
                } else {
                    //now can we find champion key
                    matchURL += "champion=";
                    matchURL += champions.data[req.body.champion].key;
                    matchURL += ("&api_key=" + API_KEY);
                    //then get data
                    //console.log("The final match url is " + matchURL);
                    https.get(matchURL, (matchRes) => {
                        if (matchRes.statusCode !== 200) {
                            res.send("Sorry, we didn't find any matches...");
                        } else {
                            const matchBody = [];
                            matchRes.on("data", (matchData) => {
                                matchBody.push(matchData);
                            }).on("end", () => {
                                const matchData = JSON.parse(Buffer.concat(matchBody));
                                Promise.all(winrate(matchData.matches, API_KEY, req.body.summoner)).then((values) => {
                                    var win = 0;
                                    var noMatches = values.length;
                                    values.forEach((value) => {
                                        win = win + value[0];
                                        noMatches = noMatches + value[1];
        
                                    });
                                    if (noMatches === 0) {
                                        noMatches = 1;
                                    }
                                    const winRate = win / noMatches;
                                    const summonerIconSrc = "http://ddragon.leagueoflegends.com/cdn/10.23.1/img/profileicon/" + String(summoner.profileIconId) + ".png";
                                    res.render("profile",{winRate:winRate,summonerIconSrc:summonerIconSrc});
                                })
                                
                            });
                        }
                    });
                }

            } else {
                //provide the api_key
                matchURL += ("api_key=" + API_KEY);
                //get all matches
                https.get(matchURL, (matchRes) => {
                    if (matchRes.statusCode !== 200) {
                        res.send("Sorry, we didn't find any matches...");
                    } else {
                        const matchBody = [];
                        matchRes.on("data", (matchData) => {
                            matchBody.push(matchData);
                        }).on("end", () => {
                            const matches = JSON.parse(Buffer.concat(matchBody));
                            res.send(matches);
                        });
                    }
                });
            }

        });
    }
}


app.route("/")
    .get((req, res) => {
        res.render("index");
    })
    .post((req, res) => {
        //get encrypted account id
        const eID_URL = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
            req.body.summoner + "?api_key=" + API_KEY;
        //send the get request to get the encrypted account id
        https.get(eID_URL, (response) => {
            checkRecord(response,req,res);
  
        });
    });

app.route("/all-champions")
    .get((req, res) => {
        res.render("allChampion", { champions: champions.data});
    })
    .post((req, res) => {
        //now parse it
        const selectedChampions = req.body.championSelection.split(',');
        console.log(selectedChampions);
        //next check win rates
        const winRates = [0.5, 0.5, 0.5, 0.5, 0.5];
        const predictedWinRate = 0.5;
        //test using my account
        
        const testAccount = "mahoniafortunei"
        const eID_URL = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
            testAccount + "?api_key=" + API_KEY;
        //send the get request to get the encrypted account id
        https.get(eID_URL, (response) => {
            const preq = {};
            preq["body"] = {};
            preq.body["champion"] = selectedChampions[0];
            preq.body["summoner"] = testAccount;
            console.log(preq.body.champion);
            checkRecord(response, preq, res);
        });
        //res.send("Your predicted win rate is "+String(predictedWinRate));
    });

app.listen(3000, () => {
    console.log("Index is running on port 3000.");
  });
