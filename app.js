const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const app = express();
//middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

//view engine
app.set('view engine', 'ejs');

//database connection
const dbURI = 'mongodb+srv://finalproject:final1234@cluster1.w9zrw.mongodb.net/full-project?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(PORT))
    .catch((err) => console.log(err));

dotenv.config({path :'.env'})
const PORT = process.env.PORT ||7000
//routes
app.get('*', checkUser);
app.get('/',(req,res) => res.render('homePage')); 
app.get('/newTask', (req,res) => res.render('newTask'));

app.use(authRoutes);