const compression = require('compression');
const express = require('express');
const utils = require('./utils');
const request = require('request');
const {
    performance
} = require('perf_hooks');

const app = express()
const port = process.env.PORT || 3000;

class Performance {
    constructor(name) {
        this.startTime = performance.now();
        this.name = name;
    }

    getElapsed() {
        return performance.now() - this.startTime;
    }

    log() {
        let name = this.name;
        let task = ((str) => {
            return str ? `Task '${str}'` : `Task`
        })(name);
        console.log(`${task} took ${this.getElapsed()}ms to complete`);
    };
}

const shouldCompress = (req, res) => {
    if (req.headers['x-no-compression']) {
        // don't compress responses if this request header is present
        return false;
    }
    // fallback to standard compression
    return compression.filter(req, res);
};

app.use(compression({
    // filter decides if the response should be compressed or not,
    // based on the `shouldCompress` function above
    filter: shouldCompress,
    // threshold is the byte threshold for the response body size
    // before compression is considered, the default is 1kb
    threshold: 0
}));

app.use(express.static("public"))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "public");
    res.header("Expires", new Date(new Date() + 9e5).toUTCString());
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
        let getUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${sheetName}`;
        console.log(getUrl);
        let p = new Performance();
        request.get(getUrl, function(err, resp, body) {
            if (!err && resp.statusCode == 200) {
                res.send({
                    "status": "OK",
                    "text": body,
                    "time": p.getElapsed()
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