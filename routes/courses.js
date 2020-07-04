const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth')
const router = Router();

router.get('/', async (req, res) => {
    const courses = await Course
      .find()
      .populate('userId', 'email name')
      .select('price title img')
      .lean();

    res.render('courses', {
        title: 'Courses page',
        isCourses: true,
        courses
    });
});

router.get('/:id/edit', auth,  async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }
    try {
        const course = await Course.findById(req.params.id).lean();

        res.render('course-edit', {
            title: `Edit ${course.title} course`,
            course
        })
    } catch (err) {
        console.log(err)
    }

});

router.post('/edit', auth, async (req, res) => {
    const { id } = req.body
    delete req.body.id

    try {
        await Course.findByIdAndUpdate(id, req.body).lean();
        res.redirect('/courses')
    } catch (err) {
        console.log(err)
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id).lean();

        res.render('course', {
            title: `Course ${course.title}`,
            course,
        });
    } catch(err) {
        next(err)
    }
});

router.post('/remove', auth,  async (req, res) => {
    try {
        await Course.deleteOne({_id: req.body.id})
        res.redirect('/courses')
    } catch (err) {
        console.log(err)
    }
})

module.exports = router;
