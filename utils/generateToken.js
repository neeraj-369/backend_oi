import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '6hr',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge:  6 * 60 * 60 * 1000, // 6 days
  });
};

export default generateToken;
