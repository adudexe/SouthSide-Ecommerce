require('dotenv').config();//configuring environment variables

const userRouter = require("./Router/userRouter");
const adminRouter = require("./Router/adminRouter");
const express = require("express");
const addToLocals  = require("./middleware/authmiddleware");
const session = require("express-session");
const app = express(); // To assign the instance of express to app
const mongoose = require("mongoose");
const nocache = require("nocache");
const morgan = require("morgan");
const flash = require("flash");
const path = require("path"); //importing path module
const passport = require('./config/passport');
// const addtolocals = require("./middleware/authmiddleware");


app.set("view engine","ejs"); //setting view engine as ejs
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,"uploads")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(nocache());
app.use(session({
    secret:process.env.SESSION_SECRET, //to set session ID shoud need to be something long and random.
    resave:false, //prevent the session from being saved into the session store if no change is made.
    saveUninitialized:true, //prevent uninitilized session from being stored.
    cookie:{ 
        secure:false, //should be kept true if in prodution  
        httpOnly:true, //to prevent attacks like CSRF.
        maxAge: 72 * 60 * 60 * 1000, // the life span of cookie in millisecondes.
        sameSite:"lax" //the coookie is sent in some same site request and in some cross site requests.
    }
}));
app.use(passport.initialize());
app.use(passport.session());


// passport.use

app.use(morgan('dev')); //To display the status code and details of each request
app.use(flash()); // To Store data and pass to different routes.
app.use(addToLocals);



app.use("/user",userRouter);
app.use("/admin",adminRouter);

// console.log(userRouter);

// app.use("*",(req,res)=>{
//     console.log("It should redirect...");
//     res.redirect("/user/home")
// })

mongoose.connect(process.env.DB_URI).then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`The Server is running on the port ${process.env.PORT}`);
        console.log("http://localhost:3000");
    })
}).catch((err)=>{
    console.log(err);
})

 

