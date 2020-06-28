const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const addRoutes = require('./routes/add')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const User = require('./models/user')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('5ef895a584b53a04168a2d2c')
        req.user = user
        next()
    } catch (err) {
        console.log(err)
    }
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        const url = `mongodb+srv://Nastya:8uLbs7tJ8HvpHG2U@cluster0-ajlou.mongodb.net/shop?retryWrites=true&w=majority`
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })

        const candidate = await User.findOne().lean()

        if (!candidate) {
            const user = new User({
                email: 'nz@gmail.com',
                name: 'Nastya',
                cart: {items: []}
            })

            await user.save()
        }

        app.listen(PORT, () => {
            console.log(`server is running.. ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}

start()



