const fs = require('fs'),
    express = require("express"),
    app = express(),
    port = require('./Rimu').port,
    Redis = require("ioredis"),
    reID = require('./Rimu').reID,
    redis = new Redis(reID),
    {
        log
    } = require('./etc/utils');

function startWebServer() {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if ('OPTIONS' == req.method)
            res.sendStatus(200);
        else
            next();
    });
    //app.use(express.static(__dirname + "/web"));
    app.get("/", (req, res) => {
        const _index = fs.readFileSync(__dirname + '/web/index.html', {
            encoding: "utf8"
        });
        res.send(_index.replace(/%%port%%/g, port));
    });
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
    app.get("/h_log", (req, res) => {
        redis.get("h_log").then(e => {
            let out = '';
            e.forEach(line => {
                out += "<br/>" + line;
            });
            res.send(out);
        })
    });
    app.listen(port, () => {
        log("Website ready", 1);
    });
}

module.exports = {
    startWebServer
}