const express = require('express')
const utils = require('./utils')
const request = require('request');
const fs = require('fs');

const app = express()
const port = process.env.PORT || 3000;

app.use(express.static("public"))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/dl', (req, res) => {
    let queryParams = utils.getUrlQueryParams(req.url);
    if (queryParams == null) {
        res.status = 400;
        res.send("bad request");
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
                    "status": "ok",
                    "text": body
                });
            }
        });
    } else {
        res.status = 400;
        res.send("bad request");
        return;
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})