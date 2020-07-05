const keys = require('../keys');

module.exports = function(email, order) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: 'Registration is success',
		html: `
			<h1>Thanks for your order</h1>
			<hr/>
			<p>Order id ${order.id}</p>
			<p>Course name ${order.courses[0].course.title}</p>
			<p>Course price ${order.courses[0].course.price}</p>
			<a href="${keys.BASE_URL}">Courses shop</a>
		`
	}
}
