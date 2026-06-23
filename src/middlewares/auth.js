const adminAuth = (req, res, next) =>{
    console.log("Admin Auth called");

    const token = "xyz";
    const isAuthorized = token === "xyz";

    if(! isAuthorized) req.status(401).send("Not Authorized");

    else next();
 
};