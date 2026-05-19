import jwt from "jsonwebtoken"

export const generateToken=(user)=>{
    if(!process.env.JWT_SECRET){
        throw new Error("JWT_SECRET is not set in environment variables")
    }
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicUrl: user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : null,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  )
}