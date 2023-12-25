const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userModel = new mongoose.Schema(
    {
        username: String,
        password: String,
        email: String,
        
    },
    { timestamps: true }
);

userModel.plugin(plm);
// userModel.plugin(plm, { usernameField: "email" });

module.exports = mongoose.model("user", userModel);
