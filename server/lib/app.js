'use strict';

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var builder = require('xmlbuilder');
var parseString = require('xml2js').parseString;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var _ = require('lodash');
var compactObject = require('compactobject');
var multer  = require('multer');
var getProp = require('get-prop');
var s3 = require('./s3');
var config = require('../config/auth.json');

var databaseName = 'database-dev.sqlite';

if (process.env.NODE_ENV === 'production') {
  databaseName = 'database.sqlite';
}

var sequelize = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: path.resolve(__dirname + '/../db/' + databaseName)
});

var Podcast = sequelize.define('podcast', {
  title: Sequelize.STRING,
  link: Sequelize.STRING,
  language: Sequelize.STRING,
  copyright: Sequelize.STRING,
  subtitle: Sequelize.STRING,
  author: Sequelize.STRING,
  summary: Sequelize.TEXT,
  description: Sequelize.TEXT,
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  image: Sequelize.STRING,
  categories: Sequelize.STRING,
  complete: Sequelize.BOOLEAN,
  explicit: Sequelize.BOOLEAN,
  newFeedUrl: Sequelize.STRING
});

Podcast.sync().then(function() {
  Podcast.findOrCreate({where: {id: 1}});
});

var PodcastItem = sequelize.define('podcastItem', {
  podcastId: Sequelize.INTEGER,
  title: Sequelize.STRING,
  author: Sequelize.STRING,
  subtitle: Sequelize.STRING,
  summary: Sequelize.TEXT,
  image: Sequelize.STRING,
  enclosureUrl: Sequelize.STRING,
  enclosureLength: Sequelize.BIGINT,
  guid: Sequelize.STRING,
  pubDate: Sequelize.STRING,
  duration: Sequelize.STRING,
  explicit: Sequelize.BOOLEAN,
  closedCaptioned: Sequelize.BOOLEAN,
  order: Sequelize.STRING
});

PodcastItem.sync();

 function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'example.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,token');

  next();
}

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({inMemory: true}));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

function requireAuth(req, res, next) {
  var token = req.params.token || req.headers.token;

  if (token === config.token || req.method === 'OPTIONS') {
    next();
  } else {
    res.json(400, {
      errors: [
        {message: 'Token required.'}
      ]
    });
  }
}

app.all('/api/1/podcasts', requireAuth);
app.all('/api/1/storage', requireAuth);
app.all('/api/1/xml', requireAuth);

app.get('/api/1/podcasts', function(req, res) {
  Podcast.find({where: {id: 1}}).then(function(podcast) {
    PodcastItem.findAll({where: {podcastId: 1}}).then(function(podcastItems) {
        res.json({
          podcasts: [podcast],
          podcastItems: podcastItems
        });
    }).catch(function() {
      res.json(400, {
        errors: [
          {message: 'Records not found.'}
        ]
      });
    });
  }).error(function() {
    res.json(400, {
      errors: [
        {message: 'Records not found.'}
      ]
    });
  });
});

app.put('/api/1/podcasts/:id', function(req, res) {
  var body = req.body;
  var podcast = body.podcast;
  var id = req.params.id;
  var attributes = _.omit(podcast, 'id');

  console.log('body', body);
  console.log('attributes', attributes);

  Podcast.find({where: {id: 1}}).then(function(podcast) {
    if (podcast) {
      podcast.updateAttributes(attributes).then(function(podcast) {
        res.json({
          podcast: podcast
        });
      }).error(function() {
        res.json(400, {
          errors: [
            {message: 'Record failed to update.'}
          ]
        });
      });
    } else {
      res.json(400, {
        errors: [
          {message: 'Record not found.'}
        ]
      });
    }
  }).error(function() {
    res.json(400, {
      errors: [
        {message: 'Record not found.'}
      ]
    });
  });
});

app.get('/api/1/podcasts/items', function(req, res) {
  PodcastItem.findAll({where: {podcastId: 1}}).then(function(podcastItems) {
    res.json({
      podcastItems: podcastItems
    });
  }).error(function() {
    res.json(400, {
      errors: [
        {message: 'Records not found.'}
      ]
    });
  });
});

app.post('/api/1/podcasts/items', function(req, res) {
  var body = req.body;
  var podcast = body.podcastItem;

  var defaults = {
    podcastId: 1
  };

  var payload = _.extend({}, defaults, podcast);

  PodcastItem.build(payload).save().then(function(item) {
    res.json({
      podcastItem: item
    });
  }).catch(function() {
    res.json(400, {
      errors: [
        {message: 'Failed to create record.'}
      ]
    });
  });

});

app.put('/api/1/podcasts/items/:id', function(req, res) {
  var body = req.body;
  var item = body.podcastItem;
  var id = req.params.id;

  console.log('body', body);

  var attributes = _.omit(item, 'id');

  console.log('attributes', attributes);

  PodcastItem.find({where: {id: id}}).then(function(podcastItem) {
    if (podcastItem) {
      podcastItem.updateAttributes(attributes).then(function(podcastItem) {
        res.json({
          podcastItem: podcastItem
        });
      }).error(function() {
        res.json(400, {
          errors: [
            {message: 'Record failed to update.'}
          ]
        });
      });
    } else {
      res.json(400, {
        errors: [
          {message: 'Record not found.'}
        ]
      });
    }
  });
});

app.delete('/api/1/podcasts/items/:id', function(req, res) {
  var body = req.body;
  var id = req.params.id;

  console.log('id', id);

  PodcastItem.find({where: {id: id}}).then(function(podcastItem) {
    if (podcastItem) {
      podcastItem.destroy().then(function(podcastItem) {
        res.json({
          podcastItem: podcastItem
        });
      }).error(function() {
        res.json(400, {
          errors: [
            {message: 'Record failed to delete.'}
          ]
        });
      });
    }
  }).error(function(error) {
    console.log('Error', error);
      res.json(400, {
        errors: [
          {message: 'Record not found.'}
        ]
      });
  });
});

app.post('/api/1/podcasts/publish', function(req, res) {
  var body = getProp(req, 'body.podcastPublish', {});
  var xml = body.xml;
  var name = body.name;

  var params = {
    Key: name,
    Body: new Buffer(xml)
  };

  s3.upload(params, function(err, data) {
    console.log(err, data);
    if (err) {
      res.json(400, {
        errors: [
          err
        ]
      });
    } else {
      res.json({published: true});
    }
  });
});

app.get('/api/1/storage', function(req, res) {
  var params = req.params;

  params = {
    MaxKeys: 1000,
    Delimiter: '/'
  };

  s3.list(params, function(err, data) {
    console.log(err, data);
    if (err) {
      res.json(400, {
        errors: [
          {message: err}
        ]
      });
    } else {
      var items = _.map(data.Contents, function(item) {
        item.id = item.Key;
        return item;
      });
      res.json({storage: items});
    }
  });
});

app.post('/api/1/storage', function(req, res) {
  var body = req.body;
  console.log('body', body);
  console.log('files', req.files);
  var buf = getProp(req, 'files.file.buffer');
  console.log('file buffer', buf);

  var params = {
    Key: body.name,
    Body: buf
  };

  s3.upload(params, function(err, data) {
    console.log(err, data);
    if (err) {
      res.json(400, {
        errors: [
          err
        ]
      });
    } else {
      res.json({storage: data.Contents});
    }
  });
});

app.delete('/api/1/storage/:key', function(req, res) {
  var body = req.body;
  console.log('body', body);
  console.log('params', req.params);

  var params = {
    Key: req.params.key
  };

  s3.remove(params, function(err, data) {
    console.log(err, data);
    if (err) {
      res.json(400, {
        errors: [
          {message: err}
        ]
      });
    } else {
      res.json(data);
    }
  });
});

app.post('/api/1/xml', function(req, res) {
  Podcast.find({where: {id: 1}})
    .then(function(podcast) {
      PodcastItem.findAll({where: {podcastId: 1}})
      .then(function(podcastItems) {

        var feed = {
          rss: {
            '@xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
            '@version': '2.0',
          }
        };

        var channel = compactObject({
          channel: {
            title: podcast.title,
            link: podcast.link,
            language: podcast.language,
            copyright: podcast.copyright,
            'itunes:subtitle': podcast.subtitle,
            'itunes:author': podcast.author,
            'itunes:summary': podcast.summary,
            'description': podcast.description,
            'itunes:image': {
              '@href': podcast.image
            },
            'itunes:category': {
              '@text': podcast.categories
            },
            'itunes:owner': {
              'itunes:name': podcast.name,
              'itunes:email': podcast.email,
            }
          },
          'itunes:complete': podcast.complete === true || podcast.complete === 'yes' ? 'yes' : 'no',
          'itunes:explicit': podcast.explicit === true || podcast.explicit === 'yes' ? 'yes' : 'no',
          'itunes:new-feed-url': podcast.newFeedUrl,
        });

        var items = podcastItems.map(function(item) {
          var obj = {
            item: {
              title: item.title,
              'itunes:author': item.author,
              'itunes:subtitle': item.subtitle,
              'itunes:summary': item.summary,
              'itunes:image': {
                '@href': item.image
              },
              enclosure: {
                '@url': item.enclosureUrl,
                '@length': item.enclosureLength,
                '@type': 'audio/mpeg'
              },
              guid: item.guid,
              pubDate: item.pubDate,
              'itunes:duration': item.duration,
              'itunes:explicit': item.explicit === true || item.explicit === 'yes' ? 'yes' : 'no',
              'itunes:order': item.order,
              'itunes:isClosedCaptioned': item.closedCaptioned ? 'yes' : 'no',
            }
          };

          return compactObject(obj);
        });

        var head = builder.create(feed);
        head = head.ele(channel);
        for (var i = 0; i < items.length; i++) {
          head = head.ele(items[i]).up();
        }
        var xml = head.doc().end({pretty: false});
        res.json({xml: xml});
      }).error(function(error) {
        res.json(400, {
          errors: [
            {message: error}
          ]
        });
      });
    }).error(function(error) {
      res.json(400, {
        errors: [
          {message: error}
        ]
      });
    });
});

app.post('/api/1/auth', function(req, res) {
  var body = req.body;
  var auth = body.session;

  if (auth.username === config.username && auth.password === config.password) {
    res.json({
      session: {
        token: config.token
      }
    });
  } else {
    res.json(400, {
      errors: [
        {message: 'Invalid credentials.'}
      ]
    });
  }
});

module.exports = app;
