const jwt = require('jsonwebtoken');
const isAuth = (req, res, next) => {
	jwt.verify(req.body.token, 'secret', (err, decoded) => {
		if (err) {
			console.log(err.message);
			res.sendStatus(401);
		} else {
			console.log(decoded);
			next();
		}
	});
};

module.exports = {
	isAuth: isAuth
};
