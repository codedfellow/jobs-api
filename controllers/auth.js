const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
    // const { name, email, password } = req.body
    // if (!name || !email || !password) {
    //     throw new BadRequestError("Name, email and password are required")
    // }
    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash(password, salt)
    
    // const tempUser = {name,email,password: hashedPassword}

    const user = await User.create({ ...req.body })
    // const token = jwt.sign({ userId: user._id, name: user.name }, 'jwtSecret', {
    //     expiresIn: '30d'
    // })
    const token = user.createJwt()
    // res.status(StatusCodes.CREATED).json({ user: { name: user.getName() }, token })
    res.status(StatusCodes.CREATED).json({user:{name:user.name},token})
}

const login = async (req, res) => {
    const { email, password } = req.body
    
    if (!email || !password) {
        throw new BadRequestError('Email and password is required')
    }

    const user = await User.findOne({ email })
    
    if (!user) {
        throw new UnauthenticatedError("Invalid credentials")
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid credentials")
    }

    const token = user.createJwt()
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = {register,login}