#!/usr/bin/env node

var aws = require('aws2js');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.json', encoding="ascii"));

fs.readFile(config.files, 'ascii', function (err, data) {
    if (err) throw err;
    
    var root = config.namespace;
    var fileList = data.split("\n");
    var files = [];
    for (i in fileList) {
        var filePath = fileList[i];
        if(!filePath) break;
        files.push({
            path: filePath.split(root)[1],
            file: filePath
        })
    }

    var akey = config.accessKey,
        skey = config.secretKey;

    var s3 = aws.load('s3', akey, skey);
    s3.setBucket(config.bucket);

    var headers = config.headers;

    s3.putFiles(files, '', headers, function (err, result) {
        var errors = err.filter(function (e) {
            return e ? e : false;
        });
        if(errors.length) {
            console.log(errors);
            return;
        }

        console.log(result);
    });
})

