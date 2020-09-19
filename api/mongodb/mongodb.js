// MongoClient.connect('mongodb://localhost:27017/test', { useUnifiedTopology: true })
// 	.catch((err) => console.error(err.stack))
// 	.then(async () => {
// 		console.log(await MongoClient.db);

// 	});
const { MongoClient } = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);
module.exports = async function run() {
	try {
		await client.connect();
		const database = client.db('test');
		app.locals.db = database;
	} catch (e) {
		console.log(e);
	}
};
