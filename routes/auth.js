const {Router} = require('express')
const User = require('../models/user')

const router = new Router()

router.get('/login', async (req,res) => {
	res.render('auth/login', {
		title: 'Authorisation',
		isLogin: true,
	})
})

router.get('/logout', async (req,res) => {
	req.session.destroy(() => {
		res.redirect('/auth/login#login')
	})
})


router.post('/login', async (req, res) => {
	const user = await User.findById('5ef895a584b53a04168a2d2c')
	req.session.user = user
	req.session.isAuth = true
	req.session.save(err => {
		if (err) throw err

		res.redirect('/')
	})
})

router.post('/register', async (req, res) => {

})
module.exports = router
