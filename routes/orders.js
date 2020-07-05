const {Router} = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const keys = require('../keys');
const router = new Router()
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const orderEmail = require('../emails/order')



const transporter = nodemailer.createTransport(sendgrid({
	auth: {api_key: keys.SEND_GRID_API_KEY}
}))

router.get('/', auth,   async (req, res) => {
	try {
		const orders = await Order
			.find({'user.userId': req.user._id})
			.populate('user.userId')

		res.render('orders', {
			isOrder: true,
			title: 'Orders',
			orders: orders.map(o => ({
				...o._doc,
				price: o.courses.reduce((total, c) => {
					return total += c.count * c.course.price
				}, 0)
			}))
		})
	} catch  (err)  {
		console.log(err)
	}

})

router.post('/', auth, async (req, res) => {
	try {
		const user = await req.user
			.populate('cart.items.courseId')
			.execPopulate()

		const courses  = user.cart.items.map(i =>({
			count: i.count,
			course: {...i.courseId._doc}
		}))

		const order = new Order({
			user: {
				name: req.user.name,
				userId: req.user
			},
			courses
		})

		const userEmail = await req.user.email

		await order.save()
		await req.user.clearCart()

		res.redirect('orders')
		await transporter.sendMail(orderEmail(userEmail, order))
	} catch(err) {
		console.log(err)
	}
})

module.exports = router
