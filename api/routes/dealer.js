const router = require('express').Router();
const jwt = require('jsonwebtoken');
const ObjectID = require('mongodb').ObjectID;
const { isAuth } = require('../middleware');
const bcrypt = require('bcrypt');
//Login the admin
router.post('/login', async (req, res) => {
	try {
		const database = req.app.locals.db;
		const collection = database.collection('dealer');
		const reslut = await collection.findOne({ username: req.body.username });
		bcrypt.compare(req.body.password, reslut.password).then((ress) => {
			if (ress) {
				const token = jwt.sign(
					{
						username: reslut.username,
						id: reslut._id
					},
					'secret',
					{ expiresIn: 60 * 60 }
				);
				res.json({ token });
			} else {
				res.sendStatus(401);
			}
		});
	} catch (err) {
		console.log(err);
	}
});

//Check if the dealer is authenticated
router.post('/auth', (req, res) => {
	jwt.verify(req.body.token, 'secret', (err, decoded) => {
		if (err) {
			console.log(err.message);
			res.sendStatus(401);
		} else {
			console.log(decoded);
			res.sendStatus(200);
		}
	});
});
//Get all the products
router
	.post('/products', isAuth, async (req, res) => {
		try {
			const database = req.app.locals.db;
			const collection = database.collection('dealer');
			const reslut = await collection.find({ username: req.body.username }).project({ products: 1 });
			const response = [];
			await reslut.forEach((doc) => response.push(doc));
			await res.json(response);
		} catch (err) {
			console(err);
		}
	}) //Create a new product
	.post('/product', isAuth, async (req, res) => {
		const product = {
			name: req.body.name,
			_id: ObjectID(),
			title: req.body.title,
			description: req.body.description,
			image: req.body.image,
			price: req.body.price,
			unit: req.body.unit,
			cat: req.body.cat
		};
		try {
			const database = req.app.locals.db;
			const collection = database.collection('dealer');
			const reslut = await collection.updateOne({ username: 'mass' }, { $push: { products: product } });
			console.dir(reslut.insertedCount);
			res.sendStatus(200);
		} catch (err) {
			console.log(err);
		}
	}) //Edit a product
	.put('/product/:id', isAuth, async (req, res) => {
		const filter = { username: 'mass', 'products._id': ObjectID(req.params.id) };
		console.log(filter);
		const updateDoc = {
			$set: {
				'products.$.name': req.body.name,
				'products.$.title': req.body.title,
				'products.$.description': req.body.description,
				'products.$.image': req.body.image,
				'products.$.price': req.body.price
			}
		};
		const options = { upsert: false };
		try {
			const database = req.app.locals.db;
			const collection = database.collection('dealer');
			const result = await collection.updateOne(filter, updateDoc, options);
			console.log(
				`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
			);
			res.sendStatus(200);
		} catch (err) {
			console(err);
		}
	}) // Delete a vendor
	.delete('/product/:id', isAuth, async (req, res) => {
		try {
			const database = req.app.locals.db;
			const collection = database.collection('dealer');
			const result = await collection.updateOne(
				{ username: req.body.username },
				{ $pull: { products: { _id: ObjectID(req.params.id) } } }
			);
			console.log(
				`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
			);
			res.sendStatus(200);
		} catch (err) {
			console(err);
		}
	});
router
	.post('/settings', isAuth, async (req, res) => {
		try {
			const database = req.app.locals.db;
			const collection = database.collection('dealer');
			const reslut = await collection.find({ username: req.body.username }).project({ live: 1 });
			const response = [];
			await reslut.forEach((doc) => response.push(doc));
			await res.json(response);
			console.log(reslut);
		} catch (err) {
			console.log(err);
		}
	})
	.put('/settings', isAuth, async (req, res) => {
		try {
			const database = req.app.locals.db;
			const collection = database.collection('dealer');
			const updateDoc = { $set: { live: req.body.set } };
			const options = { upsert: true };
			const result = await collection.updateOne({ username: req.body.username }, updateDoc, options);
			console.log(
				`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
			);
			res.sendStatus(200);
		} catch (err) {
			console.log(err);
		}
	});

module.exports = router;
