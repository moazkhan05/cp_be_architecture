# cp_be_architecture

## Dependencies
Mongo DB , redis and redis service should be installed in your machine

## Steps to Execute
1. npm install
2. npm run start 


The current system uses  
Redis - Caching
Bull  - Queueing System
Mongo - Database
Express - REST API

# improvements 
We can use below mentioned services while deploying on a Cloud service such as AWS, Azure or Heroku
NGINX -  for load balancing
PM2 - for monitoring , restarting server , alerts and logging
Sharding and Indexing in mongodb

Also we can structured our code base in such a way
### my-project
### |   ├── src
### |   |   ├── config
### |   |   |   ├── mongoose.js
### |   |   |   ├── cache.js
### |   |   |   ├── queue.js
### |   |   |   └── index.js
### |   |   ├── modules
### |   |   |   ├── users
### |   |   |   ├── user.controller.js
### |   |   |   ├── user.services.js
### |   |   |   ├── user.routers.js
### |   |   |   └── other-modules
### |   |   ├── models
### |   |   |   ├── user.js
### |   |   |   └── other-model.js
### |   |   ├── routes
### |   |   |   ├── users.js
### |   |   |   └── other-route.js
### |   |   └── server.js
### |   ├── index.js