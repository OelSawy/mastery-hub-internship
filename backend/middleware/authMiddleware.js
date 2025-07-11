// /middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import tokenBlacklistModel from "../models/tokenBlacklist.js";

dotenv.config();

const verifyToken = async (req, res, next, allowedRoles) => {
  // Retrieve the tokens from cookies
  const token = req.cookies?.token;
  const refreshToken = req.cookies?.refreshToken;

  if (!token && !refreshToken) {
    return res.status(403).json({ message: 'Access denied. No tokens provided.' });
  }

  try {
    // Check if the auth token is blacklisted
    const blacklistedToken = token && await tokenBlacklistModel.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).send("Invalid or expired token.");
    }

    // Verify the auth token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If the auth token is expired, attempt to refresh it
        if (err.name === "TokenExpiredError" && refreshToken) {
          jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (refreshErr, refreshDecoded) => {
            if (refreshErr) {
              return res.status(401).json({ message: "Invalid or expired refresh token." });
            }

            // Issue a new auth token
            const newToken = jwt.sign(
              { username: refreshDecoded.username, type: refreshDecoded.type, _id: refreshDecoded._id },
              process.env.JWT_SECRET,
              { expiresIn: "2h" }
            );

            // Update the cookies with the new token
            res.cookie('token', newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 2 * 60 * 60 * 1000, // 2 hours
            });

            // Attach the refreshed token's payload to the request object
            req.user = refreshDecoded;

            // Proceed to the next middleware
            return next();
          });
        } else {
          return res.status(403).json({ message: 'Invalid or expired token.' });
        }
      } else {
        // Token is valid, check user role if required
        if (allowedRoles && !allowedRoles.includes(decoded.type)) {
          return res.status(403).json({ message: 'Forbidden: Insufficient role.' });
        }

        // Attach the user information to the request
        req.user = decoded;

        // Proceed to the next middleware
        next();
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const checkBlacklistedToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send("Token is required");
  }

  try {
    const blacklistedToken = await tokenBlacklistModel.findOne({ token: token });
    if (blacklistedToken) {
      return res.status(401).send("Invalid or expired token");
    }

    // Proceed to the next middleware if the token is not blacklisted
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export default { verifyToken, checkBlacklistedToken };