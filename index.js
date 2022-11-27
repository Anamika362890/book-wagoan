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

        const bookingsCollection = client.db('bookWagon').collection('booking');


        app.get('/booking', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);

        })

        app.post('/booking', async (req, res) => {
            const user = req.body;
            const result = await bookingsCollection.insertOne(user);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        app.get('/users', async (req, res) => {
            const query = {};
            const options = await usersCollection.find(query).toArray();
            res.send(options);
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
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;

            const query = { category_id: (id) };
            const query2 = { service_id: (id) };
            const category = await categoryCollection.findOne(query2);
            const service = await productsCollection.find(query).toArray();
            for (let i = 0; i < service.length; i++) {
                service[i].category_id = category.name;
                console.log(service.category);
            }
            // console.log(service);

            // console.log(category.name);
            res.send(service);

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