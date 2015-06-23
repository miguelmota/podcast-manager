'use strict';

var AWS = require('aws-sdk');
var _ = require('lodash');

AWS.config.loadFromPath(__dirname + '/../config/s3.json');

var s3 = new AWS.S3();

var globalParams = {
  Bucket: 'robit'
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
