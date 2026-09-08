const cron = require("node-cron");
const {subDays, startOfDay, endOfDay} = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");

cron.schedule("* * * * * *" , ()=>{
    // Send Emails to all the people who got requests previous day
    try{
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequests = ConnectionRequestModel.find({
            status: "interested",
            createdAt: {
                $gte : yesterdayStart,
                $lt : yesterdayEnd,
            },
        }).populate("fromUserId toUserId") ;
    }
    catch(err){
        console.error(err);
    }
});


