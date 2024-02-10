const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = async (req, res, next) => {
  const { refreshToken, authToken } = req.cookies;
  try {
    jwt.verify(authToken, process.env.AUTH_TOKEN, (err, data) => {
      if (data) {
        console.log({ authToken });
        req.body.userID = data.userID;
        next();
      } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, data) => {
          if (data) {
            const newAuthToken = jwt.sign(
              { email: data.email, id: data._id },
              process.env.authToken,
              {
                expiresIn: "1h",
              }
            );
            console.log({ newAuthToken });
            res.cookie("authToken", newAuthToken, {
              httpOnly: true,
              maxAge: 1 * 60 * 60 * 1000,
              sameSite: "none",
              secure: true,
            });
            req.body.userID = data.userID;
            next();
          } else {
            throw new Error("Not Authorized");
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = auth;
