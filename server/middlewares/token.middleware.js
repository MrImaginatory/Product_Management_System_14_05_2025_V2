import jwt from 'jsonwebtoken';

const checkToken = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Token Not Found! Login First' });
    }

    const token = req.headers.authorization.split(' ')[1] || req.headers.cookie.split('=')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized User! Login First' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};  

export default checkToken;