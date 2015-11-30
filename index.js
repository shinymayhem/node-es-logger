/* eslint-env node */

var bunyan = require('bunyan');
var ElasticsearchStream = require('bunyan-elasticsearch-updated');


/**
 * Creates bunyan logger bound to elasticsearch output.
 *
 * @param {Object} opts
 * @param {String} opts.name The log name
 * @param {String} opts.host The hostname of elasticsearch cluster
 * @param {String} opts.indexPattern
 * @param {String} opts.type
 * @param {Boolean} opts.quiet
 */
module.exports.create = function create(opts) {
    'use strict';

    opts = opts || {};

    if (opts.host == null) {
        throw new Error('es-logger: `host` parameter is required');
    }

    if (opts.name == null) {
        throw new Error('es-logger: `name` parameter is required');
    }


    var esStream = new ElasticsearchStream({

        indexPattern: opts.indexPattern || '[logstash-]YYYY.MM.DD',
        host: opts.host,
        type: opts.type || function(entry) {
          return entry["_type"] || "logs";
        }

    });

    var streams = [{

        stream: esStream

    }];

    if (!opts.quiet) {

        streams.push({

            stream: process.stdout

        });

    }

    var logger = bunyan.createLogger({

        name: opts.name,
        streams: streams,
        serializers: bunyan.stdSerializers

    });

    logger.log = log;

    return logger;

};

var log = function log(type, data) {
  if (arguments.length === 1 || data === undefined) {
    data = type;
    type = "string";
  }
  var logObject = {};
  logObject["_type"] = type;
  if (typeof data === "string") {
    this.info(logObject, data);
  } else {
    logObject.data = data;
    this.info(logObject, "object");
  }
};
