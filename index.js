const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Fo30HhqhPCSD8vvV


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vedvc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const jobsCollection = client.db('job-portal').collection('all-jobs');
    const applyJobsCollection = client.db('job-portal').collection('apply-jobs');

    app.get("/", async (req, res) => {
        res.send("Welcome to the Express server");
      });

      app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().limit(6).toArray();
            res.send(result);
      });
      app.get('/all-jobs', async (req, res) => {
        const result = await jobsCollection.find().toArray();
        res.send(result);
  });

  app.get('/application/apply/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const result = await jobsCollection.findOne(filter);
            res.send(result);
  });

  // job apply api
  app.post('/job-application',async (req, res) => {
        const body = req.body;
        const result = await applyJobsCollection.insertOne(body);
        res.send(result);
  });

  app.get('/application/me', async (req, res) => {
      const email = req.query.email;
      const filter = {user_email: email};
    //   if(req.user.email !== req.query.email) {
    //      return res.status(403).send({message: "Forbidden token"});
    //   }
      const result = await applyJobsCollection.find(filter).toArray();
      for (const application of result) {
            const id = {_id: new ObjectId(application.job_id)}
            const jobs = await jobsCollection.findOne(id);
            if(jobs){
                application.company = jobs.company

            }
      }
      res.send(result);
  });

  app.get('/job-details/:id', async (req, res) => {
     const id = req.params.id;
     const filter = {_id: new ObjectId(id)};
     const result = await jobsCollection.findOne(filter);
     res.send(result);
  });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
