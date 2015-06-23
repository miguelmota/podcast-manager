// Use this file to load current feed xml file to database.

var fs = require('fs');
var path = require('path');
var builder = require('xmlbuilder');
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var getProp = require('get-prop');
var compactObject = require('compactobject');
var request = require('request');

var REST_URL = 'http://localhost:5789/';

var args = process.argv;
var filename = path.resolve(args[2]);

var stream = fs.createReadStream(filename);

var data = '';

stream.on('data', function(chunk) {
  data += chunk;
});

stream.on('end', function() {
  processXML(data.toString());
});

function processXML(xmlstring) {
  parseString(xmlstring, function(err, result) {
    if (err) {
      console.err(error);
      return false;
    }

    var channel = getProp(result, 'rss.channel.0');

    var podcast = compactObject({
      title: getProp(channel, 'title.0', '').trim(),
      link: getProp(channel, 'link.0', '').trim(),
      language: getProp(channel, 'language.0', '').trim(),
      copyright: getProp(channel, 'copyright.0', '').trim(),
      subtitle: getProp(channel, '[itunes:subtitle].0', '').trim(),
      author: getProp(channel, '[itunes:author].0', '').trim(),
      summary: getProp(channel, '[itunes:summary].0', '').trim(),
      description: getProp(channel, 'description.0', '').trim(),
      name: getProp(channel, '[itunes:owner].0.[itunes:name].0', '').trim(),
      email: getProp(channel, '[itunes:owner].0.[itunes:email].0', '').trim(),
      image: getProp(channel, '[itunes:image].0.$.href', '').trim(),
      categories: getProp(channel, '[itunes:category].0.$.text', '').trim(),
      complete: getProp(channel, '[itunes:complete].0', '').trim(),
      explicit: getProp(channel, '[itunes:explicit].0', '').trim(),
      newFeedUrl: getProp(channel, '[itunes:new-feed-url].0', '').trim()
    });

    request({
      method: 'PUT',
      url: REST_URL + 'api/1/podcasts/1',
      json: {
        podcast: podcast
      }
    }, function(err, response, body) {
      if (err) {
        console.error(err);
        return false;
      }
      console.log(body);
    });

    var podcastId = 1;

    var podcastItems = getProp(channel, 'item', []).map(function(item, i) {
      return compactObject({
        podcastId: podcastId,
        title: getProp(item, 'title.0', '').trim(),
        author: getProp(item, '[itunes:author].0', '').trim(),
        subtitle: getProp(item, '[itunes:subtitle].0', '').trim(),
        summary: getProp(item, '[itunes:summary].0', '').trim(),
        image: getProp(item, '[itunes:image].0.$.href', '').trim(),
        enclosureUrl: getProp(item, '[enclosure].0.$.url', '').trim(),
        enclosureLength: getProp(item, '[enclosure].0.$.length', '').trim(),
        guid: getProp(item, 'guid.0', '').trim(),
        pubDate: getProp(item, 'pubDate.0', '').trim(),
        duration: getProp(item, '[itunes:duration].0', '').trim(),
        explicit: getProp(item, '[itunes:explicit].0', '').trim(),
        closedCaptioned: getProp(item, '[itunes:isClosedCaptioned].0', '').trim(),
        order: getProp(item, '[itunes:order].0', '').trim(),
      });
    });

    podcastItems.reverse().forEach(function(item) {
      request({
        method: 'POST',
        url: REST_URL + 'api/1/podcasts/items',
        json: {
          podcastItem: item
        }
      }, function(err, response, body) {
        if (err) {
          console.error(err);
          return false;
        }
        console.log(body);
      });
    });

  });
}
