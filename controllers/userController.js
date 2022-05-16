const models = require('../models/index');
const jsonwebtoken = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { promisify } = require('util');

const { sign, verify } = jsonwebtoken;

const signToken = (id) => {
    return sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        secure: false,
        httpOnly: true,
    };
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};


exports.login = catchAsync(async (req, res, next) => {
    if (!req.body.password || !req.body.email) {
        return next(new AppError('Please fill empty fields!', 400));
    }
    let user = await models.User.findOne({ where: { email: req.body.email } });
    if (!user || user.password !== req.body.password)
        return next(new AppError('Wrong email or password!', 401));

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (req.body.jwt) {
        token = req.body.jwt;
    }
    if (!token || token === 'loggedout') {
        return next(
            new AppError('You are not logged in! please login to get access', 401)
        );
    }
    const decoded = await promisify(verify)(token, process.env.JWT_SECRET);

    const currentUser = await models.User.findByPk(decoded.id);

    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token does no longer exist', 401)
        );
    }

    req.user = currentUser;
    next();
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success', data: null });
}


exports.updateUser = catchAsync(async (req, res, next) => {
    const existingUser = await models.User.findOne({ where: { email: req.body.email } });
    console.log(req.user.email !== req.body.email, req.user.email, req.body.email)
    if (existingUser?.dataValues?.email && req.user.email !== req.body.email) {
        return next(new AppError('The email already exists!!', 409));
    }
    -await models.User.update(req.body, {
        where: {
            id: req.user.id
        }
    });

    res.status(200).json({
        status: 'success',
        message: "User updated successfully"
    });
});
exports.userProfile = catchAsync(async (req, res, next) => {
    const user = await models.User.findByPk(req.user.id);
    user.password = undefined
    res.status(200).json({
        status: 'success',
        data: { user }
    });
});