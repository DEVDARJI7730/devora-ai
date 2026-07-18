const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'devora_secret_key_123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  try {
    // Validation
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all fields' });
    }

    // Check if user exists by email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email address already in use' });
    }

    // Check if user exists by username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already in use' });
    }

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error during registration' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    // Find by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    // Check password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error during login' });
  }
};

// @desc    Auth with Google OAuth token
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { token, profile } = req.body;

  try {
    let email, name, googleId, picture;

    // 1. If we have a Google Client ID, verify token properly
    if (process.env.GOOGLE_CLIENT_ID && token) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload['email'];
      name = payload['name'];
      googleId = payload['sub'];
      picture = payload['picture'];
    } else if (profile) {
      // 2. Mock / Dev Fallback: Accept profile data directly if verification isn't configured
      email = profile.email;
      name = profile.name;
      googleId = profile.googleId || profile.sub;
      picture = profile.picture || profile.avatar;
    } else {
      return res.status(400).json({ error: 'Invalid Google sign-in credentials' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Google account has no email address' });
    }

    // Search for existing user
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // Update googleId and last login if needed
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      user.lastLogin = Date.now();
      await user.save();
    } else {
      // Create new user
      const uniqueUsername = `google_${email.split('@')[0]}_${Math.random().toString(36).substring(2, 6)}`;
      user = await User.create({
        fullName: name,
        username: uniqueUsername,
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        emailVerified: true,
      });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Google Login processing failed' });
  }
};

// @desc    Get currently logged in user info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      fullName: req.user.fullName,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.fullName = req.body.fullName || user.fullName;
    
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({ username: req.body.username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      user.username = req.body.username.toLowerCase();
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
      user.email = req.body.email.toLowerCase();
      user.emailVerified = false; // Reset verification if email changed
    }

    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error updating profile' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({ error: 'Google login accounts cannot change password. Use profile editing instead.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error changing password' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // You could also delete user chats here
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error deleting account' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }

    // Simulate sending a token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    // In production, send this via nodemailer. For now, return it in development response.
    res.json({
      success: true,
      message: 'Password reset code sent to your email address.',
      devOtp: resetToken, // Returned for testing purposes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error generating reset link' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error resetting password' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
  logoutUser,
};
