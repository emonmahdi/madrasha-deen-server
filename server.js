const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const PORT = process.env.PORT || 5000;

dotenv.config();

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebn1vec.mongodb.net/madrashaDB?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Madrasha Deen server open ");
});

async function madrashaServer() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const classesCollection = client.db("madrashaDB").collection("classes");
    const admissionCollection = client
      .db("madrashaDB")
      .collection("admissions");

    app.get("/classes/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await classesCollection.findOne(query);

        if (!result) {
          return res.status(404).send("Class not found");
        }

        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch classes data" });
      }
    });

    // Class GET API
    app.get("/classes", async (req, res) => {
      try {
        const result = await classesCollection.find().toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch classes" });
      }
    });

    // Class POST API
    app.post("/classes", async (req, res) => {
      const body = req.body;
      const result = await classesCollection.insertOne(body);
      console.log("Post class Data: ", result);
      res.send(result);
    });

    // Post Admission API
    app.post("/admissions", async (req, res) => {
      const admissionData = req.body;

      try {
        const result = await admissionCollection.insertOne(admissionData);
        console.log(result);
        res.status(200).send(result);
      } catch (error) {
        console.log("Failed to admission post", err);
        res.status(500).json({ message: "Failed to submit admission" });
      }
    });

    // GET API Admission Using Email query
    app.get("/admissions", async (req, res) => {
      const email = req.query.email;
      const query = email ? { userEmail: email } : {};
      const result = await admissionCollection.find(query).toArray();
      res.send(result);
    });

    // GET All Admissions (for Admin)
    app.get("/admissions", async (req, res) => {
      try {
        const result = await admissionCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch admission data" });
      }
    });

    // Update Admission Status
    app.patch("/admissions/:id", async (req, res) => {
      try {
        const id = req?.params?.id;
        const { status } = req.body;
        const query = { _id: new ObjectId(id) };

        const result = await admissionCollection.updateOne(query, {
          $set: {
            status,
          },
        });

        if (result.modifiedCount === 0) {
          res.status(400).send({ message: "NO Admission Found" });
        }
        res.send({ message: "Status updated successfully" });
      } catch (error) {
        res.status(500).send({ message: "Failed to update admission" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Madrasha Server successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
madrashaServer().catch(console.dir);





app.listen(PORT, () => {
  console.log(`Madarasha Deen Server Running ${PORT}`);
});
