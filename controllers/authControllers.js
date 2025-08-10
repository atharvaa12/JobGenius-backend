const db=require('../utils/db.js');
exports.register=async (req,res)=>{
    const {email, password}=req.body;   
    const queryText=req.body;
    try{
    await db.query(
        'INSERT INTO userauth (email, password) VALUES ($1,$2)',
        [username,password]
    );
    res.status(201).json({message:'successful'});

    }
    catch(error){
        console.error('registration error:', error);
        res.status(500).json({error: 'Internal server error'});

    }



};