const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session)
const path = require('path');
const mongoose = require('mongoose')
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const addRoutes = require('./routes/add')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const User = require('./models/user')
const varMiddleware = require('./middleware/variable')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const MONGODB_URI = `mongodb+srv://Nastya:8uLbs7tJ8HvpHG2U@cluster0-ajlou.mongodb.net/shop?retryWrites=true&w=majority`

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});
const store = new MongoStore({
    collection: 'sessions',
    uri: MONGODB_URI
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'some secret value',
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(varMiddleware)

app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })

        app.listen(PORT, () => {
            console.log(`server is running.. ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}

start()



