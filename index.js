const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dqus0zu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const categoryCollection = client.db('bookWagon').collection('categories');
        const productsCollection = client.db('bookWagon').collection('products');
        const usersCollection = client.db('bookWagon').collection('users');

        const bookingsCollection = client.db('bookWagon').collection('booking');


        app.get('/booking', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Forbidden' })
            }
            const query = { buyer_email: email };
            const booking = await bookingsCollection.find(query).toArray();
            res.send(booking);

        })
        ///

        app.get('/lproducts', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Forbidden' })
            }
            const query = { email: email };
            const booking = await productsCollection.find(query).toArray();
            res.send(booking);

        })


        app.post('/booking', async (req, res) => {
            const user = req.body;
            const result = await bookingsCollection.insertOne(user);
            res.send(result);
        })


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            console.log(user);
            res.status(403).send({ accessToken: 'Token' });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        app.get('/sellers', async (req, res) => {
            const role = req.query.role;
            const query = { role: "Seller" };
            const options = await usersCollection.find(query).toArray();
            res.send(options);

        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };

            const result = await usersCollection.deleteOne(filter);
            res.send(result);

        })


        app.get('/buyers', async (req, res) => {
            const role = req.query.role;
            const query = { role: "Buyer" };
            const options = await usersCollection.find(query).toArray();
            res.send(options);

        })

        app.delete('/buyers/:id', async (req, res) => {
            const id = req.params.id;
            const Bfilter = { _id: ObjectId(id) };
            const Bresult = await usersCollection.deleteOne(Bfilter);
            res.send(Bresult);

        })


        app.get('/users', async (req, res) => {
            const query = {};
            const options = await usersCollection.find(query).toArray();
            res.send(options);
        })

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);
            if (user?.admin !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    admin: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })





        app.put('/users/verify/:id', async (req, res) => {

            // const decodedEmail = req.decoded.email;
            // const query = { email: decodedEmail };
            // const user = await usersCollection.findOne(query);
            // if (user?.admin !== 'admin') {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: 'verified'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
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


        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const productsfilter = { _id: ObjectId(id) };
            const productResult = await productsCollection.deleteOne(productsfilter);
            res.send(productResult);

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
