const {body} = require('express-validator');
const User = require('../models/user')

exports.registerValidators = [
	body('email')
		.isEmail()
		.withMessage('Input correct email')
		.custom(async (value, {req}) => {
			try {
				const user = await User.findOne({email: value})

				if (user) {
					return Promise.reject('This email already exist')
				}

			} catch (e) {
				console.log(e)
			}
		})
		.normalizeEmail(),
	body('password', 'Password must be more then 6 characters')
		.isLength({min: 6, max: 56})
		.isAlphanumeric()
		.trim(),

	body('confirm')
		.custom((value, {req}) => {
			if (value !== req.body.password) {
				throw new Error('Passwords must be equal')
			}

			return true
		})
		.trim(),

	body('name', 'Name must be more then 3 characters')
		.isLength({min: 3})
		.trim(),
]

exports.logInValidators = [
	body('email')
		.isEmail()
		.withMessage('Input correct email')
		.custom(async (value, {req}) => {
			try {
				const user = await User.findOne({email: value})

				if (!user) {
					return Promise.reject(`This user does not exist. 
					Please check your email address!`)
				}

			} catch (e) {
				console.log(e)
			}
		})
		.normalizeEmail(),

	body('password', 'Password must be more then 6 characters')
		.isLength({min: 6, max: 56})
		.isAlphanumeric()
		.trim(),
]

exports.courseValidators = [
	body('title', 'Title to short. Title min length should be more than 3 characters')
		.isLength({min: 3})
		.trim(),

	body('price', 'Input correct price')
		.isNumeric(),

	body('img', 'Input correct URL').isURL()
]
