const express = require('express');
const redis = require('redis');
const Bull = require('Bull')
const mongoose = require('mongoose');
const app = express();


// Connect to the Redis server
const client = redis.createClient(6379, '127.0.0.1');
(async () => {
    await client.connect();
})();
client.on('error', console.error.bind(console, 'Redis connection error:'));
client.once('connect', function() {
  console.log('Connected to Redis');
});


// MongoDB
mongoose.connect('mongodb://localhost/mydb', { useNewUrlParser: true });

// Get the connection object
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define schema
const User = mongoose.model('User', {
    name: String,
    email: String
  });

// Remove all existing users
User.deleteMany({}, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Successfully deleted all users');
    }
  });
  
// Create an array of users to seed
const users = [
{ name: 'Alice', age: 25 },
{ name: 'Bob', age: 30 },
{ name: 'Charlie', age: 35 }
];

// Seeding
User.insertMany(users, (err) => {
if (err) {
    console.error(err);
} else {
    console.log('Successfully Seed');
}
});


//define queue
const queue = new Bull('queue',{
    redis:client
})

// test connection
app.get('/test', async(req,res)=>{
    res.send('hello')
})



app.get('/users/:name', async (req, res) => {
    const name = req.params.name;
    const requestURL = req.originalUrl
    try {
      // Check if a request for the same user is already in the queue
      console.log({requestURL})
      const existingRequest = await client.get(requestURL);
      if (existingRequest) {
        // Request is already in queue, return message to user
        return res.send({ message: 'Request is already being processed' });
      }
  
      //set url in cache and pop once the job done to avoid de-duplication 
      await client.set(requestURL,1);
      // Add the request to the queue with delay to test de-duplication
      const request = await queue.add({ name }, {delay:5000});
      if (request) {
      
        // Try to fetch the user from Redis
        const user = JSON.parse(await client.get(name));
        
        if (user) {
            console.log('returning form redis');
            // User found in Redis, send it back to the client
            await client.del(requestURL)
            request.remove();
            return res.send(user);
        } else {
    
            // User not found in Redis, fetch it from MongoDB
            const user = await request.finished();
            if (user) {
                console.log('returning form mongo',{user});
                await client.del(requestURL)
                request.remove();
                // User found in MongoDB, send it back to the client, store it in Redis, and pop the request from the queue
                await client.set(name, JSON.stringify(user));
                return res.send(user);
            } else {
                return res.sendStatus(404);
            }
            }
        }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

queue.process(async(job)=>{
    try {
        // Fetch data from mongoose
        const data = await User.findOne(job.data);
        // Return data to caller
        return { data };
        } catch (error) {
        throw error;
        }
})

app.listen(3000, () => {
  console.log('API listening on port 3000');
});
