
const express = require("express");
const bcrypt = require("bcryptjs")
const User = require("../models/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middleware/authMiddleware");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";



const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";


function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
router.post("/register", async(req,res) => {

  
    try{
        const{name,email,password} = req.body;
        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({
                success:false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
        });
        res.status(201).json({
               success : true,
               message: "User registered successfully",
            
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
});


router.post("/login",async(req,res) =>{
        try{
        const{email, password} = req.body;
            console.log(email);
    console.log(password);
         if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password required" });
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if(!isMatch ){
          return res.status(400).json({
            success: false,
            message: "Invalid Password",
          });
        }
      
    //    token create
  const token = createToken({ id: user._id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

res.status(200).json({
    success:true,
    message: "Login successful",
    token,
    user:{
        id:user._id,
        name:user.name,
        email:user.email,
    },
});
    }
     catch(error){
        console.log(error);
            res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
});

router.get("/me" , authMiddleware, async(req,res)=> {
    try{
        const user = await User.findById(req.user.id).select("-password");
        res.json({
            success:true,
            user
        });
    }catch(error) {
        res.status(500).json({
            success:false,
            message:"Server error"
        });
    }
});
router.get("/profile", authMiddleware, (req,res) => {

    res.status(200).json({
        success:true,
        user:req.user,
    });
});

module.exports = router;