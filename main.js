const express = require('express');
const utils = require('./utils');
const Performance = require('./performance');
const request = require('request');

const app = express();
const port = process.env.GSPROXY_PORT || 3000;

// Load API keys from environment variable
const API_KEYS = (process.env.GSPROXY_API_KEYS || "").split(",");

// Middleware for API key validation
app.use((req, res, next) => {
    const apiKey = req.headers['authorization'];

    if (!apiKey || !API_KEYS.includes(apiKey)) {
        return res.status(403).json({ status: "Unauthorized", message: "Invalid or missing API key" });
    }

    next();
});

app.use(express.static("public"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.get('/dl', (req, res) => {
    let queryParams = utils.getUrlQueryParams(req.url);
    if (!queryParams) {
        return res.status(400).send("bad request: no arguments supplied");
    }

    if ("id" in queryParams && "sheetName" in queryParams) {
        let id = queryParams.id;
        let sheetName = queryParams.sheetName;
        let getUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${sheetName}`;

        let p = new Performance();
        request.get(getUrl, (err, resp, body) => {
            if (!err && resp.statusCode == 200) {
                res.json({ "status": "OK", "text": body, "time": p.getElapsed() });
            } else {
                res.status(500).json({
                    "status": "DownloadFailed",
                    "text": body,
                    "responseCode": resp.statusCode,
                    "message": resp.statusMessage,
                    "reqUrl": getUrl
                });
            }
        });
    } else {
        let missingParams = [];
        if (!("id" in queryParams)) missingParams.push("id");
        if (!("sheetName" in queryParams)) missingParams.push("sheetName");

        res.status(400).json({
            status: "QueryStringMissingParams",
            missing: missingParams,
        });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
