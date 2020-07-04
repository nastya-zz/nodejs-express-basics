const {Router} = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs');

const router = new Router()

router.get('/login', async (req,res) => {
	res.render('auth/login', {
		title: 'Authorisation',
		isLogin: true,
		loginError: req.flash('loginError'),
		regError: req.flash('regError')
	})
})

router.get('/logout', async (req,res) => {
	req.session.destroy(() => {
		res.redirect('/auth/login#login')
	})
})


router.post('/login', async (req, res) => {
	try {
		const {email, password} = req.body
		const candidate = await User.findOne({email})

		if (candidate) {
			const areSame = await bcrypt.compare(password, candidate.password)

			if (areSame) {
				req.session.user = candidate
				req.session.isAuth = true
				req.session.save(err => {
					if (err) throw err

					res.redirect('/')
				})
			} else {
				req.flash('loginError', "Wrong password")
				res.redirect('/auth/login#login')
			}
		} else {
			req.flash('loginError', "User with this email doesn't exist")
			res.redirect('/auth/login#login')
		}
	} catch (err) {
		console.log(err)
	}
})

router.post('/register', async (req, res) => {
	try {
		const {email, password, repeat, name} = req.body

		const candidate = await User.findOne({email})
		if (candidate) {
			req.flash('regError', 'User with this email already exist')
			res.redirect('/auth/login#register')
		} else {
			const hashPassword = await bcrypt.hash(password, 10)
			const user = new User({
				email,
				name,
				password: hashPassword,
				cart: {
					items: []
				}})
			await user.save()
			res.redirect('/auth/login#login')
		}
	} catch (err) {
		console.log(err)
	}
})

module.exports = router
