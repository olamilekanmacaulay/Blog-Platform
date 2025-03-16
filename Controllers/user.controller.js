const User = require("../Models/user.model");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { username, email, password, role } = req.body;
    const isUser = await User.findOne({ email });
    if (isUser) {
    return res
        .status(400)
        .send("user already exists");
    }
    try {
        const user = await User.create({ username, email, password, role });
        res.status(201).json({ 
            message: "User created successfully",
        });
    } catch (error) {
        res.status(400).json({
        message: "Error creating user", 
        });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email});
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn:"1h" });
        return res
        .cookie("token", token, { httpOnly: true })
        .status(200)
        .json(user);

    } catch (error) {
        res.status(400).send("Error loggin in")
    }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = { register, login, deleteUser };