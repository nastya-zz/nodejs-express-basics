const keys = require('../keys');

module.exports = function(email, token) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: 'Reset password',
		html: `
			<h1>Are you forgot the password? </h1>
			<p>If not skip this message</p>
			<p><a href="${keys.BASE_URL}/auth/password/${token}">Recovery password link</a></p>
			<hr/>
			<a href="${keys.BASE_URL}">Courses shop</a>
		`
	}
}
