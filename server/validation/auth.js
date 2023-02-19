import jwt from "jsonwebtoken";

const createAccessToken = (user) => {
    const data = {
        fullName: `${user.firstName} ${user.lastName}`,
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
    };
    const options = {
        algorithm: "HS256",
    };
    return jwt.sign(data, process.env.ACCESS_TOKEN_KEY, options);
};

const verify = (req, res, next) => {
    let token = req.headers.authorization;
    if (typeof token !== "undefined") {
        token = token.slice(7, token.length);

        return jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, data) => {
            if (error) {
                return res.send({ auth: "failed" });
            } else {
                next();
            }
        });
    } else {
        return res.send({ message: "Please log in first" });
    }
};

const decode = (token) => {
    if (typeof token !== "undefined") {
        token = token.slice(7, token.length);

        return jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, data) => {
            if (error) {
                return res.status(400).json({ message: "decode error" });
            } else {
                return jwt.decode(token, { complete: true }).payload;
            }
        });
    }
};

export { createAccessToken, verify, decode };
