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
            return winrate(matchList,summoner);
        }).then((winrate) => {
            if (isNaN(winrate)) {
                res.send("No games found...");
            } else {
                res.send(String(winrate));
            }
            
        }).catch((err) => {
            res.render("404");
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
        const testUser = "mahoniafortunei"
        //test using my account

        const summoner = getSummonerByName(testUser);
        summoner.then((user) => {
            const winRatePromises = []
            selectedChampions.forEach((champion) => {
                winRatePromises.push(getMatchList(user, champion).then((matchList) => {
                    return winrate(matchList, user);
                }));
            });
            Promise.all(winRatePromises).then((values) => {
                console.log(values);
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
 });




app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
});
app.listen(3000, () => {
    console.log("Index is running on port 3000.");
  });
