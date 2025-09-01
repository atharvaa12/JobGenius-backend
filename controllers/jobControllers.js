const db = require('../utils/db');
const axios = require('axios');
exports.createJobPost = async (req, res) => {
  try {
    const employerId = req.user.id;
    //console.log(req.body);
    let { title, body, terminate_at, max_applications, min_10th, min_12th } =
      req.body;
    terminate_at =
      terminate_at === '' || terminate_at === undefined ? null : terminate_at;
    min_10th =
      min_10th === '' || min_10th === undefined ? null : Number(min_10th);
    min_12th =
      min_12th === '' || min_12th === undefined ? null : Number(min_12th);
    max_applications =
      max_applications === '' || max_applications === undefined
        ? null
        : Number(max_applications);

    const body_response = await axios.post(
      `${process.env.VOYAGE_AI_API}/embed-text`,
      { text: body }
    );
    const body_embed = '[' + body_response.data.embedding.join(',') + ']';

    const query = `
      INSERT INTO jobs (
        employer_id, title, body, job_embed, terminate_at,
        max_applications, min_10th_percentage, min_12th_percentage
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    await db.query(query, [
      employerId,
      title,
      body,
      body_embed,
      terminate_at,
      max_applications,
      min_10th,
      min_12th,
    ]);
    res.status(200).json({ message: 'added job sucessfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'error creating job post' });
  }
};
exports.showJobs = async (req, res) => {
  try {
    const { sort } = req.query;
    let query = `SELECT j.job_id, j.title, j.created_at, j.terminate_at, j.max_applications, j.cur_applications, j.min_10th_percentage, j.min_12th_percentage,
    e.org, e.org_avatar
    FROM jobs j, employer_biodata e
    where j.employer_id=e.employer_id AND j.active
    `;
    if (sort === 'popular') {
      query += `ORDER BY cur_applications DESC`;
    } else if (sort === 'recent') {
      query += `ORDER BY created_at DESC`;
    }
    query += `;`;
    const dbResponse = await db.query(query, []);
    res.json(dbResponse.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'error showing job postings' });
  }
};
exports.applyToJob = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { job_id } = req.body;

    await db.withTransaction(async (client) => {
      const checkQuery=`SELECT cur_applications, max_applications FROM jobs WHERE job_id=$1;`;
      const checkResponse=await client.query(checkQuery,[job_id]);
      if(checkResponse.rows.length===0 || checkResponse.rows[0].cur_applications+1>checkResponse.rows[0].max_applications){
        throw new Error(`max_applications reached`);
      }
      const query1 = `INSERT INTO applications (user_id, job_id, status) VALUES ($1,$2,$3) `;
      await client.query(query1, [user_id, job_id, 'pending']);
      const query2 = `UPDATE jobs SET cur_applications=cur_applications+1 WHERE job_id=$1`;
      await client.query(query2, [job_id]);
    });
    res.json({ message: 'applied successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'error applying to job ' });
  }
};
exports.showJobsByEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { active } = req.query;

    if (!employerId) {
      return res.status(400).json({ message: 'Employer ID is required' });
    }

    let query = `
      SELECT j.job_id, j.title, j.body, j.created_at, j.terminate_at,
             j.max_applications, j.cur_applications,
             j.min_10th_percentage, j.min_12th_percentage,
             j.active, e.org, e.org_avatar
      FROM jobs j
      JOIN employer_biodata e ON j.employer_id = e.employer_id
      WHERE j.employer_id = $1
    `;
    const params = [employerId];

    if (active === 'true') {
      query += ` AND j.active = true`;
    } else if (active === 'false') {
      query += ` AND j.active = false`;
    }

    query += ` ORDER BY j.created_at DESC`;

    const dbResponse = await db.query(query, params);
    res.status(200).json(dbResponse.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching jobs for employer' });
  }
};
exports.showJobsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const query = `
      SELECT a.application_id, a.status, a.job_id,
             j.title, j.body, j.created_at, j.terminate_at,
             j.max_applications, j.cur_applications,
             j.min_10th_percentage, j.min_12th_percentage,
             j.active,
             e.org, e.org_avatar
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN employer_biodata e ON j.employer_id = e.employer_id
      WHERE a.user_id = $1
      ORDER BY j.created_at DESC;
    `;

    const dbResponse = await db.query(query, [userId]);
    res.status(200).json(dbResponse.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching jobs for user' });
  }
};
exports.showJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const query = `
      SELECT j.job_id, j.title, j.body, j.created_at, j.terminate_at,
             j.max_applications, j.cur_applications,
             j.min_10th_percentage, j.min_12th_percentage,
             j.active,
             e.org, e.org_avatar, e.firstname AS employer_firstname, e.lastname AS employer_lastname,
             e.city AS employer_city, e.state AS employer_state, e.country AS employer_country
      FROM jobs j
      JOIN employer_biodata e ON j.employer_id = e.employer_id
      WHERE j.job_id = $1
    `;

    const dbResponse = await db.query(query, [jobId]);

    if (dbResponse.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(dbResponse.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching job details' });
  }
};
exports.showJobApplicants=async (req,res)=>{
      const job_id=req.params.jobId;
      
      try{
        const query=`SELECT job_embed FROM jobs WHERE job_id=$1;`
        const response=await db.query(query,[job_id]);
       // console.log(response);
        const {job_embed}=response.rows[0];
        console.log(typeof job_embed);
        const job_embed_string=job_embed;
      
        let matchQuery=`SELECT u.user_id, u.user_avatar_link, u.firstname, u.lastname, 1-(u.resume_embed <=> $2::vector) as similarity
        FROM applications a, user_biodata u
        WHERE a.job_id=$1 AND a.user_id=u.user_id ORDER BY similarity DESC;`
        const  applicants=await db.query(matchQuery,[job_id,job_embed_string]);
        res.status(200).json(applicants.rows);        
        

      }
      catch(err){
        console.log(err);
        res.status(500).json({message:"error fetching applicants"});
      }
};
exports.showJobsByTitle=async(req,res)=>{
  const search=req.params.title;
  try{
          const query=`SELECT 
          j.job_id, 
          j.title, 
          j.body,
          e.org_avatar,
          ts_rank(
              setweight(to_tsvector('english', j.title), 'A') ||
              setweight(to_tsvector('english', j.body), 'B'),
              plainto_tsquery('english', $1)
          ) AS rank
      FROM jobs j
      JOIN employer_biodata e ON j.employer_id = e.employer_id
      WHERE (to_tsvector('english', j.title) || to_tsvector('english', j.body))
            @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT 20;`
      const result = await db.query(query,[search]);
      res.status(200).json(result.rows);

  }
  catch(err){
    console.log(err);
    res.status(500).json({message:"error fetching jobs"});
  }
};