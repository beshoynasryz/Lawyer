// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config/jwtConfig');
const userValidator = require('../Validations/userValidator');

exports.registerUser = async (req, res) => {
  try {
    // Validate user input
    const { error } = userValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
   
    // Destructure user data from request body
    const {
      role,
      first_name,
      last_name,
      phone_number,
      password,
      confirm_password,
      national_number,
      lawyer_price,
      specializations,
    } = req.body;
   
    console.log('req.body:', req.body);

    const certification = req.files['certification'] ? req.files['certification'][0].buffer : null;

    // Check if the password and confirm_password match
    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const newUser = await User.create({
      role,
      first_name, 
      last_name,
      phone_number,
      password: hashedPassword,
      confirm_password: hashedPassword,
      national_number,
      lawyer_price,
      specializations,
      certification
    });
   
    // Generate JWT token
    const token = jwt.sign({ userID: newUser.userID }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    // Respond with the token
    res.status(201).json({"msg":"user has been created"});
  } catch (error) {
    // Handle errors
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    console.log('Login request received for phone_number:', phone_number);

    // Find user by phone_number
    const user = await User.findOne({ where: { phone_number } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userID: user.userID }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
