const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());
require('dotenv').config();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.c2bp6su.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const promoCodeCollection = client.db('promocodejobtask').collection('addpromocode');

        //Post the promo codes to database
        app.post('/PromoCodes', async (req, res) => {
            const promoCodeInfo = req.body;
            console.log(promoCodeInfo);
            const result = await promoCodeCollection.insertOne(promoCodeInfo);
            res.send(result);
        })

        //get all the promo codes from database
        app.get('/AllPromoCodes', async (req, res) => {
            const query = {};
            const result = await promoCodeCollection.find(query).toArray();
            res.send(result);
        })

        //match the promo codes from database
        app.get('/PromoCodes/:appliedPromoCode', async (req, res) => {
            const promoCode = req.params.appliedPromoCode;
            console.log("Applied Promo Code", promoCode);
            const query = { promo_code: promoCode }
            const result = await promoCodeCollection.findOne(query);
            console.log("Apply Promo Code Result", result);

            if (result === null) {
                const message = 'Promo Code is not matching';
                return res.send({ acknowledged: false, message });
            }

            res.send({ acknowledged: true, result });
        })

        //delete a promo code
        app.delete('/deletePromoCode/:id', async (req, res) => {
            const id = req.params.id;
            console.log("Deleted ID", id);
            const filter = { _id: new ObjectId(id) };
            console.log("Filter", filter);
            const result = await promoCodeCollection.deleteOne(filter);
            res.send(result);
        })


        //update promo code
        app.put('/updatePromoCode/:id', async (req, res) => {
            
            const id = req.params.id;
            console.log("Promo Code ID", id);

            const updatedPromoCodeInfo = req.body;
            console.log("Updated Promo Code Info", updatedPromoCodeInfo);

            const filter = { _id: new ObjectId(id) };

            const option = { upsert: true };
            const updatedPromoCode = {
                $set: {
                    promo_code: updatedPromoCodeInfo.promo_code,
                    discount: updatedPromoCodeInfo.discount
                }
            }

            const result = await promoCodeCollection.updateOne(filter, updatedPromoCode, option)
            res.send(result);

        })

    }
    finally {

    }
}
run().catch(error => console.log(error))


app.get('/', async (req, res) => {
    res.send('Promo Code Server Running');
})

app.listen(port, (req, res) => {
    console.log("Promo Code Server is running on port ", port)
})