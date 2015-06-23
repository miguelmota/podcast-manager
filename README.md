# Podcast Manager

> Node.js + Ember.js app for managing iTunes podcasts. Assets stored on [S3](http://aws.amazon.com/s3/) with [AWSJavaScriptSDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html). Data persisted on [sqlite3](https://www.sqlite.org/) local database with [sequelize](http://docs.sequelizejs.com/).

# Install

```
npm install

cd client
npm install && bower install
```

# Development

Set credentials

```bash
server/config/auth.json
server/config/s3.json
```

Node server

```bash
node server/server.js
```

Ember app

```bash
cd client

ember server
```

# Production

Node server

```bash
NODE_ENV=production node server/server.js
```

Ember app

```bash
cd client
ember build --environment=production
# serve dist/
```

# License

MIT
