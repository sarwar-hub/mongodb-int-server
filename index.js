const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// reuire dotenv
require('dotenv').config()

// middlewares
app.use(cors()); // to connect with client side (to pass data to client side)
app.use(express.json()); // to connect with client side (to get data from client side)


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.nb3yaqn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



   


    // setup database and collection
    const database = client.db("usersdb");
    const usersCollection = database.collection("users");

    // setup posting to database
    app.post('/users', async(req, res)=> {
        // get data from client side
        const newUser = await req.body;
        // post to database
        const result = await usersCollection.insertOne(newUser);
        // response to client
        res.send(result);
    })

    // get update data and update on database
    app.put('/users/:id', async(req, res)=> {
        const id = await req.params.id;
        const updateInfo = await req.body;
        const filter = {_id: new ObjectId(id)};
        const option = {upsert: true};
        const updateUser = {
          $set: {
            name: updateInfo.name
          }
        };
        const result = await usersCollection.updateOne(filter, updateUser, option);
        res.send(result);
    })
    

    // setup get and send all data to client side response
    app.get('/users', async(req, res)=> {
        const cursor = await usersCollection.find();
        const results = await cursor.toArray();
        res.send(results);
    })


    // setup get and send single data to client side response
    app.get('/users/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const user = await usersCollection.findOne(query);
      res.send(user);
    })


    // setup delete from database
    app.delete('/users/:id', async(req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await usersCollection.deleteOne(query);
        res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res)=> {
    res.send('database-int server');
})


app.listen(port, ()=>{
    console.log(`databse-int server running on port: ${port}`);
})