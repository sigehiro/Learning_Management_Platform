const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const User = require("../models/user");


module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: "email" }, function (email, password, done) {
        User.findOne({ email: email, password: password }).then((user) => {
            if (user) {
                done(null, user);
            }
            else {
                done(null, false, "No such user")
            }
        })
    }))
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    
    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            console.log(user)
            done(null, user)
        }).catch((error) => {
            done(error, false);
        })
    })
}

