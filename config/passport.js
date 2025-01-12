const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../model/userModel"); // Assuming you have a User model

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/user/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // console.log(profile); // Log the profile information for debugging
        
        // Check if the user already exists in the database by their Google ID
        let user = await User.findOne({ googleId: profile.id });
        // console.log("User 1 ",user);
        // If user exits
        if(user)
        {
        //    req.session.user = user;
           return done(null,user);
        }
        else{
            console.log(profile.email)
            //if user present with the email and no google id is present 
            user = await User.findOne({email:profile.email[0].value})
            console.log()
            // console.log("hi2")
            if(user)
            {
                user.googleId = profile.id;
                await user.save();
                req.session.user = user;
            }
            else
            {
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    // profilePic: profile.photos ? profile.photos[0].value : null,
                });
                await user.save();
                // req.session.user = user;
                return done(null, user);
            }
        }
    } 
    catch (err) {
        console.error("Error during authentication: ", err);
        return done(err, null); // Pass the error to done
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id); // Store the user's MongoDB id in the session
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id); // Retrieve user by id
    done(null, user);
});


module.exports = passport;