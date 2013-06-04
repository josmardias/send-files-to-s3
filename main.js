#!/usr/bin/env node

var aws = require('aws2js');
var fs = require('fs');
var path = require('path');
var async = require('async');

var configFile = path.resolve(path.dirname(require.main.filename), 'config.json');
var config = JSON.parse(fs.readFileSync(configFile, encoding="ascii"));

function chunk (arr, chunkSize) {
    var retArr = [];
    for (var i = 0; i < arr.length - (chunkSize - 1); i++){
        retArr.push(arr.slice(i, i+chunkSize));
    }
    return retArr;
}


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

    var akey, skey;
    akey = config.accessKey;
    skey = config.secretKey;

    var s3 = aws.load('s3', akey, skey);
    s3.setBucket(config.bucket);

    var iterator = function (el, callback) {
        var headers = config.headers;
        s3.putFiles(el, '', headers, function (err, result) {
            var errors = err.filter(function (e) {
                return e ? e : false;
            });
            if(errors.length) {
                callback(errors);
                return;
            }

            callback(null);
        });
    };

    chunckedFiles = chunk(files, 20);
    async.eachSeries(chunckedFiles, iterator, function (err) {
        if (err) console.log(err);
        console.log('finished uploading');
    });

})

