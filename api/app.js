const env = require('dotenv').config();
const express = require('express');
const app = express();
const admin = require('./routes/admin');
const cros = require('cors');
const { MongoClient } = require('mongodb');
const dealer = require('./routes/dealer');
const user = require('./routes/user');
app.use(cros());
app.use(express.json());

//Providing mongodb instance globally===================================================//
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });
(async function run() {
	try {
		await client.connect().then(() => console.log('Mongodb has connected'));
		const database = client.db('myMart');
		app.locals.db = database;
	} catch (e) {
		console.log(e);
	}
})();
//=======================================================================================//

app.use('/admin', admin);
app.use('/dealer', dealer);
app.use('/user', user);
app.get('/mongotest', async (req, res, next) => {
	try {
		const database = req.app.locals.db;
		const collection = database.collection('dealer');
		const bismi = [
			{
				dealer_name: 'bismi',
				username: 'shibu',
				phone: 9088797878,
				email: 'shibu@gmail.com',
				address: 'calicut',
				no_of_orders: '0',
				password: 'mass'
			},
			{
				dealer_name: 'marginfree',
				username: 'shibu',
				phone: 9088797878,
				email: 'shibu@gmail.com',
				address: 'calicut',
				no_of_orders: '0',
				password: 'machan'
			}
		];
		const reslut = await collection.insertMany(bismi);
		console.dir(reslut.insertedCount);
	} catch (err) {
		next(err);
	}
});

// MongoClient.connect('mongodb://localhost:27017/test', { useUnifiedTopology: true })
// 	.catch((err) => console.error(err.stack))
// 	.then(async () => {
// 		console.log(await MongoClient.db);

// 	});
// const uri = 'mongodb://127.0.0.1:27017';
// const client = new MongoClient(uri);
// async function run() {
// 	try {
// 		await client.connect();
// 		const database = client.db('test');
// 		app.locals.db = database;
// 	} catch (e) {
// 		console.log(e);
// 	}
// }
// run().catch(console.dir);

app.listen(process.env.PORT, () => {
	console.log('Your server is runing in ' + process.env.PORT + ' master');
});
