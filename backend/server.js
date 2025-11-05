//server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import errorHandler from './src/middlewares/error.middleware.js';
// import authRoutes from './src/routes/auth.routes.js';
import con from './src/config/index.js';
import bodyParser from 'body-parser';
import session from 'express-session';
import mysqlSession from 'express-mysql-session';
import categoryRoutes from "./src/routes/category.routes.js";
import userRoutes from "./src/routes/user.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const MySQLStore = mysqlSession(session);
var sessionStore = new MySQLStore(con.config);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('trust proxy', 1) // trust first proxy

var sessionStore = new MySQLStore(con.config);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

// Middeware
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Content-Disposition'],
//     exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
// }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Welcome');
});

app.listen(port , (req , res) => {
    console.log(`Server is running on http://localhost:${port}`);
})