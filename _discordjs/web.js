const express = require("express");
const app = express();
const Redis = require("ioredis");
const reID = "redis://redistogo:3836450ed78400a4656586f169cf2765@scat.redistogo.com:11383/";
const port = process.env.PORT || 3000;
const redis = new Redis(reID);
const ngrok = require('ngrok');

function startWebServer() {
    (async () => {
        console.log('ngrok url: ' + await ngrok.connect(port))
    })();
    app.use(express.static(__dirname + "/web"));
    app.get("/port", (req, res) => {
        res.send(`<html>${port}</html>`)
    });
    app.get("/h_cpu", (req, res) => {
        redis.get("h_cpu").then(e => res.send(`${e}`))
    });
    app.get("/d_guild", (req, res) => {
        redis.get("d_guild").then(e => res.send(`${e}`))
    });
    app.get("/d_user", (req, res) => {
        redis.get("d_user").then(e => res.send(`${e}`))
    });
    app.listen(port, () => {
        console.log("Website ready")
    });
}

module.exports = {
    startWebServer
}