const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const user = require('./routers/userRouter.js');
const globalErrorHandler = require('./controllers/errorController.js');
const AppError = require('./utils/AppError.js');

const app = express();

app.use(cors());
app.options('*', cors())

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./models')

db.sequelize.sync();

app.get("/", (req, res) => {
    res.status(200).json({ message: "welcome" })
})

app.use("/user", user);

app.all('*', (req, res, next) => {
    next(
        new AppError(`Opps! can't find "${req.originalUrl}" on this server!`, 404)
    );
});

app.use(globalErrorHandler);

module.exports = app;