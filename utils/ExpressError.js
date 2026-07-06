// Custom error that carries both a message and the HTTP status to return.
class ExpressError extends Error{
    constructor(statusCode,message){
        super(message);
        this.statusCode=statusCode;
    }
}
module.exports=ExpressError;
