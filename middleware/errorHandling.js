const errorHandling = {};


errorHandling.errorHandlingMiddleware = (err,req,res,next) => {
    console.log(err.stack);
    res.status(500).send({error:"Something Went Wrong"});
}

module.exports = errorHandling;