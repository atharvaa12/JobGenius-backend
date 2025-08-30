const db=require('../utils/db');
const axios=require('axios');
exports.createJobPost=async(req,res)=>{
    try{
       const employerId=req.user.id;
       //console.log(req.body);
       let {
        title,
        body,
        terminate_at,
        max_applications,
        min_10th,
        min_12th,
        
       }=req.body;
       terminate_at = terminate_at === "" || terminate_at===undefined? null : terminate_at;
       min_10th = min_10th === ""   || min_10th===undefined?null : Number(min_10th);
       min_12th = min_12th === ""  || min_12th===undefined ? null : Number(min_12th);
       max_applications=max_applications==="" || max_applications===undefined ?null:Number(max_applications);

       const body_response=await axios.post(`${process.env.VOYAGE_AI_API}/embed-text`,{text:body});
       const body_embed='['+body_response.data.embedding.join(',')+']';
       
       const query = `
      INSERT INTO jobs (
        employer_id, title, body, job_embed, terminate_at,
        max_applications, min_10th_percentage, min_12th_percentage
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
      await db.query(query,[employerId,title,body,body_embed,terminate_at,max_applications,min_10th,min_12th]);
       res.status(200).json({message:"added job sucessfully"});

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"error creating job post"});

    }
};
exports.showJobs=async(req,res)=>{
  try{
    const query=`SELECT j.job_id, j.title, j.created_at, j.created_at, j.max_applications, j.cur_applications, j.min_10th_percentage, j.min_12th_percentage,
    e.org, e.org_avatar
    FROM jobs j, employer_biodata e
    where j.employer_id=e.employer_id AND j.active;
    `;
    const dbResponse=await db.query(query,[]);
    res.json(dbResponse.rows);
  }
  catch(err){
    console.log(err);
    res.status(500).json({message:"error showings job postings"});
  }
};
