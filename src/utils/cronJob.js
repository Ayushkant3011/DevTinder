const cron = require("node-cron");
const {subDays, startOfDay, endOfDay} = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");

cron.schedule("* * * * * *" , async ()=>{
    // Send Emails to all the people who got requests previous day
    try{
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequests = await ConnectionRequestModel.find({
            status: "interested",
            createdAt: {
                $gte : yesterdayStart,
                $lt : yesterdayEnd,
            },
        }).populate("fromUserId toUserId");


        const listOfEmails = [...new Set(pendingRequests.map(req => req.toUserId.emailId))];

        for(const email of listOfEmails){
            // Send Emails
            try{
                const res = await sendEmail.run(
                    "New Friend Requests Pending " + email,
                    "There are so many friend requests pending for you, please login to DevTinder and Manage your requests"
                );

                console.log(res);
            }
            catch(err){
                console.error(err);
            }
        }
    }
    catch(err){
        console.error(err);
    }
});


