const {Pool}=require('pg');
const pool=new Pool({
    connectionString:process.env.SESSION_POOLER_DB_URL,
    ssl:{
        rejectUnauthorized:false,
    },
});
module.exports={
    query:(text,params)=>pool.query(text,params),
    pool,
};