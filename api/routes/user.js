const router = require('express').Router();
const jwt = require('jsonwebtoken');
const ObjectID = require('mongodb').ObjectID;
const request = require('request');
const bcrypt = require('bcrypt');

router.get('/items/:store', async (req, res) => {
	const store = req.params.store;
	try {
		const database = req.app.locals.db;
		const collection = database.collection('dealer');
		const reslut = await collection.find({ dealer_name: store }).project({ products: 1, _id: 0 });
		const response = [];
		await reslut.forEach((doc) => response.push(doc));
		await res.json(response);
	} catch (err) {
		console.log(err);
	}
});

router.post('/register', async (req, res) => {
	try {
		const database = req.app.locals.db;
		const collection = database.collection('users');
		const reslut = await collection.findOne({ phone: req.body.phone });
		if (!reslut) {
			const name = req.body.name;
			const location = req.body.location;
			const phone = req.body.phone;
			const options = {
				method: 'POST',
				url: 'https://d7networks.com/api/verifier/send',
				headers: {
					Authorization: 'Token  f5310ff5049a0cc967c0206eddd4819248961442'
				},
				formData: {
					mobile: phone,
					sender_id: 'SMSINFO',
					message: 'Your otp code is {code}',
					expiry: '900'
				}
			};
			request(options, function(error, response) {
				if (error) throw new Error(error);
				const data = JSON.parse(response.body);
				console.log(data.otp_id);
				const token = jwt.sign(
					{
						name: name,
						location: location,
						phone: phone,
						otp_id: data.otp_id
					},
					'secret',
					{ expiresIn: '180s' }
				);
				res.json({ temp: token });
			});
		} else {
			res.json({ message: 'Already Exists' });
		}
	} catch (err) {
		console.log(err);
	}
});
router.post('/register/auth', (req, res) => {
	const database = req.app.locals.db;
	const password = req.body.password;
	const otp = req.body.otp;
	console.log(otp);
	jwt.verify(req.body.token, 'secret', (err, decoded) => {
		if (err) {
			console.log(err.message);
			res.sendStatus(401);
		} else {
			console.log(decoded);
			const request = require('request');
			const options = {
				method: 'POST',
				url: 'https://d7networks.com/api/verifier/verify',
				headers: {
					Authorization: 'Token  f5310ff5049a0cc967c0206eddd4819248961442'
				},
				formData: {
					otp_id: decoded.otp_id,
					otp_code: otp
				}
			};
			request(options, async function(error, response) {
				console.log(response.body);
				if (error) throw new Error(error);
				if (JSON.parse(response.body).status === 'success') {
					const hash = await bcrypt.hash(password, 8);
					const user = {
						name: decoded.name,
						phone: decoded.phone,
						location: decoded.location,
						password: hash,
						orders: []
					};
					try {
						const collection = database.collection('users');
						const reslut = await collection.insertOne(user);
						console.dir(reslut.insertedCount);
						res.sendStatus(200);
					} catch (err) {
						console.log(err);
						res.sendStatus(501);
					}
				}
			});
		}
	});
});

router.post('/login', async (req, res) => {
	try {
		const database = req.app.locals.db;
		const collection = database.collection('users');
		const reslut = await collection.findOne({ phone: req.body.phone });
		bcrypt.compare(req.body.password, reslut.password).then((ress) => {
			if (ress) {
				const token = jwt.sign(
					{
						name: reslut.name,
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

module.exports = router;
