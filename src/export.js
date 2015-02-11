var jsforce = require('jsforce');
var fs = require("fs");
var zlib = require("zlib");
var async = require('async');
var logger = require('./logger');
require('date-utils');

// set constant variables by environment variables.
var LIMIT = process.env.SFDC_LIMIT ? process.env.SFDC_LIMIT : 500000;
var USERNAME = process.env.SFDC_USERNAME;
var PASSWORD = process.env.SFDC_PASSWORD;
var LOGIN_URL = process.env.SFDC_LOGINURL ? process.env.SFDC_LOGINURL : 'https://login.salesforce.com';
var TARGET_SOBJECTS = process.env.SFDC_TARGETOBJECT === "" ? [] : process.env.SFDC_TARGETOBJECT.split(";");
var BUCKET = process.env.S3_BUCKET;
var MODE = process.env.MODE ? process.env.MODE : "series";
var OUTPUT_DIR = "/var/log/sfdc-exportjs";

logger.log("Target Object: " + TARGET_SOBJECTS.join(","));

var conn = new jsforce.Connection({
  loginUrl : LOGIN_URL
});

conn.login(USERNAME, PASSWORD, function(err, userInfo) {
  logger.log("Login is successful.")
  
  var prefix = new Date().toFormat("YYYYMMDD");
  if (MODE == 'series') {
    async.eachSeries(TARGET_SOBJECTS, function(targetSObject, next){
      extract(targetSObject, prefix, next);
    }, function(err){
      if (err) {
        logger.error("Error is occured.");
      } else {
        logger.log("Export is complete.");
      }
    });
  } else if (MODE == 'parallel') {
    async.each(TARGET_SOBJECTS, function(targetSObject, next){
      extract(targetSObject, prefix, next);
    }, function(err){
      if (err) {
        logger.error("Error is occured.");
      } else {
        logger.log("Export is complete.");
      }
    });
  }
});

// extract records, output csv file and upload it to S3 bucket.
var extract = function(sObject, prefix, next) {
  logger.log("Start Exporting...(" + sObject + ")");

  var output_filename = OUTPUT_DIR + "/" + prefix + "_" + sObject + ".csv";
  var output_s3file = prefix + "/" + sObject + ".csv.gz";
  
  // describe field for a object 
  // set field api name to csv file as header.
  conn.describe(sObject)
    .then(function(meta) {
      var rec_cnt = 0;
      var stream = fs.createWriteStream(output_filename);
      // set csv header values to local csv file.
      
      var fields = [];
      meta.fields.forEach(function(field){
        fields.push(field.name);
      });
      var line = '"' + fields.join('","') + '"\n';
      stream.write(line);

      // export data from salesforce to local csv file.
      // then convert format from csv file to gzip file and upload converted gzip file to S3.
      conn.sobject(sObject)
        .find({})
        .on("record", function(record){
          // set field values of each record.
          var values = [];
          fields.forEach(function(field){
            values.push(String(record[field]).toString().replace(/\"/g, '""'));
          });
          var line = '"' + values.join('","') + '"\n';
          stream.write(line);

          rec_cnt++;
          if (rec_cnt % 5000 == 0) {
            logger.log(rec_cnt + " records is processed.(" + sObject + ")");
          }
        })
        .on("end", function(query){
          stream.end();
          logger.log(output_filename + " is created.(" + sObject + ")");
          // if exporting records and creating csv file is completed,
          // it is uploaded to S3 bucket.
          if (process.env.AWS_ACCESS_KEY_ID) {
            logger.log("Start uploading...(" + sObject + ")");
            var body = fs.createReadStream(output_filename).pipe(zlib.createGzip());

            var AWS = require('aws-sdk');
            var s3 = new AWS.S3();
            var s3obj = new AWS.S3({
              params: {
                Bucket: BUCKET, 
                Key: output_s3file
              }
            });
            s3obj.upload({Body: body}, function(){
              logger.log("Upload is successful.(" + sObject + ")");
              // next() call next iterater with next array value.  
              next();
            });
          } else {
            next();
          }
        })
        .on("error", function(err){
          logger.error(err);
        })
        .run({ 
          autoFetch : true, 
          maxFetch: LIMIT
        });
    });
};