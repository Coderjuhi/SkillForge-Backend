const jwt = require("jsonwebtoken");

const JWT_SECRET =
process.env.JWT_SECRET || "change_this_secret";


const authMiddleware = ( req,res,next) => {
    try{  
          const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
        if(!token){
            return res.status(401).json({
                success:false,
                message: "No token found",
            });
        }
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );
        req.user = decoded;
        next();
    }catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:error.message,
        });
    }
};

module.exports = authMiddleware;
