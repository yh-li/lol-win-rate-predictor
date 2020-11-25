const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser")
const https = require("https");
const app = express();
//get champions
const champions = require("./public/champions.json");
const winrate = require("./winrate");
const getURL = require('./url_get');
const getSummonerByName = require("./getSummonerByName");
const API_KEY = require("./api");
const { promises } = require("fs");
const getMatchList = require("./getMatchList");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


app.route("/")
    .get((req, res) => {
        res.render("index");
    })
    .post((req, res) => {
        var summoner;
        getSummonerByName(req.body.summoner).then((user) => {
            return user;
        }).then((user) => {
            summoner = user;
            return getMatchList(user,req.body.champion);
        }).then((matchList) => {
            console.log(summoner);
            return winrate(matchList,summoner);
        }).then((winrate) => {
            res.send(String(winrate));
        }).catch((err) => {
            res.send(String(err));
            console.log(err);
        });
        //send the get request to get the encrypted account id
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
