const express = require('express')
const utils = require('./utils')
const request = require('request');

const app = express()
const port = process.env.PORT || 3000;

app.use(express.static("public"))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/dl', (req, res) => {
    let queryParams = utils.getUrlQueryParams(req.url);
    if (queryParams == null) {
        res.status = 400;
        res.send("bad request: no arguments supplied");
        return;
    }
    if ("id" in queryParams && "sheetName" in queryParams && "format" in queryParams) {
        res.status = 200;
        let id = queryParams.id;
        let dlFormat = encodeURI(queryParams.format || "tsv");
        let encodedSheetName = encodeURI(queryParams.sheetName);
        let getUrl = `https://docs.google.com/spreadsheets/d/${id}/export?gid=0&format=${dlFormat}&sheet=${encodedSheetName}`;
        request.get(getUrl, function(err, resp, body) {
            if (!err && resp.statusCode == 200) {
                let data = body;
                res.send({
                    "status": "OK",
                    "text": body
                });
            } else {
                res.status = 500;
                res.send({
                    "status": `DownloadFailed, response code: ${resp.statusCode}, err: ${resp.statusMessage}, body:\n${body}`,
                    "text": null
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
        if (!("format") in queryParams) {
            list.push("format");
        }
        res.status = 400;
        res.send({
            status: "QueryStringMissingParams",
            text: null,
            missing: list.toString()

        });
        return;
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})