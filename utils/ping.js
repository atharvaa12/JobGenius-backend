const axios=require('axios');
function startPing(url,intervalMinutes=10){
    async function ping(){
        try{
            await axios.get(url);

        }
        catch(err){
            console.error(`ping failed ${err}`);

        }
    }
    ping();
    setInterval(ping,intervalMinutes*60*1000);

}
module.exports={startPing};

