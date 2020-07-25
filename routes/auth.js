const {Router} = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const {validationResult} = require('express-validator');
const {registerValidators, logInValidators} = require('../utils/validators');
const keys = require('../keys');
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')


const transporter = nodemailer.createTransport(sendgrid({
	auth: {api_key: keys.SEND_GRID_API_KEY}
}))

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

router.post('/login', logInValidators,  async (req, res) => {
	try {
		const {email, password} = req.body
		const errors = validationResult(req)
		const candidate = await User.findOne({email})

		if(!errors.isEmpty()) {
			req.flash('loginError', errors.array()[0].msg)
			return res.status(422).redirect('/auth/login#login')
		}
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
	} catch (err) {
		console.log(err)
	}
})

router.post('/register', registerValidators, async (req, res) => {
	try {
		const {email, password, name} = req.body
		const errors = validationResult(req)

		if(!errors.isEmpty()) {
			req.flash('regError', errors.array()[0].msg)
			return res.status(422).redirect('/auth/login#register')
		}

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
		await transporter.sendMail(regEmail(email))

	} catch (err) {
		console.log(err)
	}
})

router.get('/reset',  async (req, res) => {
	res.render('auth/reset', {
		title: 'Forgot email?',
		error: req.flash('error')
	})
})

router.post('/reset', (req, res) => {
	try {
		crypto.randomBytes(32, async(err, buffer) => {
			if (err) {
				req.flash('error', 'Something gone wrong, try repeat later')
				return res.redirect('/auth/reset')
			}

			const token = buffer.toString('hex')
			const candidate = await User.findOne({email: req.body.email})

			if (candidate) {
				candidate.resetToken = token
				candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
				await candidate.save()
				await transporter.sendMail(resetEmail(candidate.email, token))
				return res.redirect('/auth/login')
			} else {
				req.flash('error', "This email doesn't exist")
				res.redirect('/auth/reset')
			}
		})
	} catch (e) {
		console.log(e)
	}
})

router.get('/password/:token', async (req, res) => {
	if (!req.params.token) {
		return res.redirect('/auth/login')
	}

	try {
		const user = await User.findOne({
			resetToken: req.params.token,
			resetTokenExp: {$gt: Date.now()}
		})

		if (!user) {
			return res.redirect('/auth/login')
		} else {
			res.render('auth/password', {
				title: 'Refresh password',
				error: req.flash('error'),
				userId: user._id.toString(),
				token: req.params.token
			})
		}
	} catch (e) {
		console.log(e)
	}
})

router.post('/password', async (req, res) => {
	try {
		const user = await User.findOne({
			_id: req.body.userId,
			resetToken: req.body.token,
			resetTokenExp: {$gt: Date.now()}
		})

		if (user) {
			user.password = await bcrypt.hash(req.body.password, 10)
			user.resetToken = undefined
			user.resetTokenExp = undefined
			await user.save()
			res.redirect('/auth/login')
		} else {
			req.flash('loginError', "Link for recovery password is expired")
			res.redirect('/auth/login')
		}
	} catch (e) {
		console.log(e)
	}
})

module.exports = router
