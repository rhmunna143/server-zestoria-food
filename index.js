const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const brands = require('./brands.json');

const app = express()
const port = process.env.PORT || 7000;

// middlewares
app.use(cors())
app.use(express.json())

// test response
app.get("/", (req, res) => {
  res.send("running zestoria server : 200 OK!")
})

// Brands response
app.get("/brands", (req, res) => {
  res.send(brands)
})


// mongodb driver config

// mongo URI
const uri = `mongodb+srv://${process.env.USER_ZESTORIA}:${process.env.PASS_ZESTORIA}@cluster0.52hv04l.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    // db and collections
    const database = client.db("ZestoriaDB");
    const products = database.collection("products");
    const cart = database.collection("cart");

    // post a product document
    app.post("/products", async (req, res) => {
      const product = req?.body;

      const result = await products.insertOne(product)

      res.send(result)
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    })

    // post to cart
    app.post("/cart-post", async (req, res) => {
      const product = req.body;

      const result = await cart.insertOne(product)

      res.send(result)
    })

    // get brand filtered products
    app.get("/brand/:name", async (req, res) => {
      const brandName = req?.params?.name;
      const query = { brandName: brandName }

      try {
        const selectedProducts = await products.find(query).toArray();

        res.json(selectedProducts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      }

    })

    //get single product
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      try {
        const product = await products.findOne(query);

        res.send(product)
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      }
    })

    // get all cart products
    app.get("/my-cart", async(req, res) => {
      const cursor = cart.find();

      const result = await cursor.toArray();

      res.send(result)
    })

    // update single product
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;

      const product = {
        $set: {
          image: updatedProduct.image,
          name: updatedProduct.name,
          brandName: updatedProduct.brandName,
          price: updatedProduct.price,
          description: updatedProduct.description,
          ratings: updatedProduct.ratings,
          type: updatedProduct.type
        }
      }

      const result = await products.updateOne(filter, product, options);

      res.send(result)
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



// express listener
app.listen(port, () => {
  console.log(`zestoria listening on port ${port}`);
})