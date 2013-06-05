#!/usr/bin/env node

'use strict';

var aws = require('aws2js'),
    fs = require('fs'),
    path = require('path'),
    async = require('async');

var configFile = path.resolve(path.dirname(require.main.filename), 'config.json'),
    config = JSON.parse(fs.readFileSync(configFile, 'ascii'));

var data = fs.readFileSync(config.files, 'ascii'),
    fileList = data.split("\n").filter(function (e) { return e; }),
    s3 = aws.load('s3', config.accessKey, config.secretKey);

console.log(fileList.length + ' total files');
s3.setBucket(config.bucket);

var iterator = function (item, callback) {
    var s3Path = item.split(config.namespace)[1],
        file = item,
        headers = config.headers;

    s3.putFile(s3Path, file, '', headers, function (err, ret) {
        //hack: maping files to errors
        callback(null, err);
    });
};

async.mapLimit(fileList, 10, iterator, function (err, ret) {
    //hack: don't expect any errors, they come inside ret
    if (err) { throw err; }

    //hack: give me just the true errors
    var errors = ret.filter(function (e) { return e; });

    console.log(errors.length + ' errors');
});

