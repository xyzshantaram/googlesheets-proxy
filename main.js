const express = require('express');
const utils = require('./utils');
const request = require('request');
const Papa = require('papaparse');

const app = express()
const port = process.env.PORT || 3000;

app.use(express.static("public"))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.get('/dl', (req, res) => {
    let queryParams = utils.getUrlQueryParams(req.url);
    if (queryParams == null) {
        res.status = 400;
        res.send("bad request: no arguments supplied");
        return;
    }
    if ("id" in queryParams && "sheetName" in queryParams) {
        res.status = 200;
        let id = queryParams.id;
        let sheetName = queryParams.sheetName;
        let getUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=0&sheet=${sheetName}`;
        console.log(getUrl);
        request.get(getUrl, function(err, resp, body) {
            if (!err && resp.statusCode == 200) {
                res.send({
                    "status": "OK",
                    "text": body,
                });
            } else {
                res.status = 500;
                res.send({
                    "status": `DownloadFailed`,
                    "text": body,
                    "responseCode": resp.statusCode,
                    "message": resp.statusMessage,
                    "reqUrl": getUrl
                });
            }
        });
    } else {
        let list = []
        if (!("id" in queryParams)) {
            list.push("id");
        }
        if (!("sheetName") in queryParams) {
            list.push("sheetName");
        }
        res.status = 400;
        res.send({
            status: "QueryStringMissingParams",
            missing: list.toString(),
            reqUrl: getUrl
        });
        return;
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})