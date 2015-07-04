'use strict';

var AWS = require('aws-sdk');
var _ = require('lodash');
var s3configPath = __dirname + '/../config/s3.json';
var s3config = require(s3configPath);

var bucket = s3config.bucket;

AWS.config.loadFromPath(s3configPath);

var s3 = new AWS.S3();

var globalParams = {
  Bucket: bucket
};

function list(params, callback) {
  var localParams = _.extend({}, globalParams, params || {});

  console.log(localParams);

  s3.listObjects(localParams, function(err, data) {
    callback(err, data);
  });
}

function upload(params, callback) {
  var localParams = _.extend({}, globalParams, {
    Key: null,
    ACL: 'public-read',
    Body: null,
  }, params);

  s3.putObject(localParams, function(err, data) {
    callback(err, data);
  });
}

function remove(params, callback) {
  var localParams = _.extend({}, globalParams, {
    Key: null
  }, params);

  s3.deleteObject(localParams, function(err, data) {
    callback(err, data);
  });
}

module.exports = {
  list: list,
  upload: upload,
  remove: remove
};
