const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../model/userModel"); // Assuming you have a User model
const Wishlist = require("../model/wishlistSchema");
const Cart = require("../model/cartSchema");
const Wallet = require("../model/walletSchema");


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
            // console.log("user", user);

            if (user) {
                // User found by Google ID
                return done(null, user);
            } else {
                // If no user is found, check if the user exists by email
                user = await User.findOne({ email: profile.emails[0].value });
                // console.log("Found user by email:", user);

                if (user) {
                    // User found by email but no Google ID, update with Google ID
                    user.googleId = profile.id;
                    await user.save();

                    // Create and save related data (Cart, Wallet, Wishlist)
                    const newUserCart = new Cart({ userId: user._id });
                    await newUserCart.save();

                    const newUserWallet = new Wallet({ userId: user._id });
                    await newUserWallet.save();

                    const newUserWishList = new Wishlist({ userId: user._id });
                    await newUserWishList.save();

                    return done(null, user); // Return user after updating
                } else {
                    // If no user found, create a new one
                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        // profilePic: profile.photos ? profile.photos[0].value : null, // Optional: Handle profile picture if needed
                    });

                    await user.save();

                    // Create associated data (Cart, Wallet, Wishlist)
                    const newUserCart = new Cart({ userId: user._id });
                    await newUserCart.save();

                    const newUserWallet = new Wallet({ userId: user._id });
                    await newUserWallet.save();

                    const newUserWishList = new Wishlist({ userId: user._id });
                    await newUserWishList.save();

                    return done(null, user); // Return newly created user
                }
            }
        } catch (err) {
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