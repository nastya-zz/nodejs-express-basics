const {Router} = require('express');
const Course = require('../models/course');
const router = Router();


function mapCartItems(cart) {
	return cart.items.map(c => ({
		...c.courseId._doc,
		id: c.courseId.id,
		count: c.count
	}))
}

function computePrice(courses) {
	return courses.reduce(((total, course) => {
		return total += course.price * course.count
	}), 0)
}

router.post('/add', async (req, res) => {
	const course = await Course.findById(req.body.id);
	await req.user.addToCart(course)
	res.redirect('/card');
});

router.delete('/remove/:id', async (req, res) => {
	await req.user.removeFromCart(req.params.id)
	const user = await req.user.populate('cart.items.courseId').execPopulate()
	const courses = mapCartItems(user.cart)


	res.status(200).json({
		courses, price: computePrice(courses)
	})
})

router.get('/', async (req, res) => {
	const user = await req.user
		.populate('cart.items.courseId')
		.execPopulate()
	const courses = mapCartItems(user.cart)

	res.render('card', {
		title: "Cart",
		courses: courses,
		isCard: true,
		price: computePrice(courses)
	})
});

module.exports = router;
