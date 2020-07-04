const keys = require('../keys');

module.exports = function(email) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: 'Registration is success',
		html: `
			<h1>Welcome in our store</h1>
			<p>Your account has successful created! Your email - ${email}</p>
			<hr/>
			<a href="${keys.BASE_URL}">Courses shop</a>
		`
	}
}
