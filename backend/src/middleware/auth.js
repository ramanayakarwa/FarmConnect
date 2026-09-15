const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success:false,
                message:"No token"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch(err){

        return res.status(401).json({
            success:false,
            message:err.message
        });

    }

};

module.exports = authMiddleware;