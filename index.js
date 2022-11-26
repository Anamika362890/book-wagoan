const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dqus0zu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const categoryCollection = client.db('bookWagon').collection('categories');
        const productsCollection = client.db('bookWagon').collection('products');
        const usersCollection = client.db('bookWagon').collection('users');

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const query = {};
            const options = await productsCollection.find(query).toArray();
            res.send(options);
        })





        app.get('/category', async (req, res) => {
            const query = {};
            const options = await categoryCollection.find(query).toArray();
            res.send(options);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await categoryCollection.findOne(query);
            res.send(service);

        })


    }

    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Book Wagon is running!')
})

app.listen(port, () => {
    console.log(`Book Wagon listening on port ${port}`)
})