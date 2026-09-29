const { Employee, User } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.itLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admuser = await Employee.findOne({ username });
        if (!admuser) return res.status(401).json({ message: "User Does not exist" });

        const isMatch = await bcrypt.compare(password, admuser.password);
        if (isMatch) {
            const admintoken = jwt.sign({}, process.env.JWT_SECRET_ADMIN, { expiresIn: '1h' });
            return res.json({ message: "Success", admintoken, uname: admuser.name });
        }
        res.status(401).json({ message: "Invalid Password" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.userLogin = async (req, res) => {
    try {
        const { empid, pass } = req.body;
        const user = await User.findOne({ empid });
        if (!user) return res.status(401).json({ message: "User Does not exist" });

        const isMatch = await bcrypt.compare(pass, user.pass);
        if (isMatch) {
            const token = jwt.sign({ empid, uname: user.fullname }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: "Success", token, empid, uname: user.fullname });
        }
        res.status(401).json({ message: "Invalid Password" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};