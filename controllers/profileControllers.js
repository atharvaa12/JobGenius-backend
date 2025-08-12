const db=require('../utils/db');
const axios=require('axios');
const FormData=require('form-data');
const supabaseStorage=require('../utils/storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

  
exports.getUserProfile =async  (req, res) => {
    // req.user was set by authenticateToken middleware
    const userId = req.user.id;
    try{
        const query = 'select user_id, firstname, lastname, age, male, city, state, country,"10th_percentage", "12_percentage", undergrad_cgpa, postgrad_cgpa, undergrad_institute, postgrad_institute, resume_link, undergrad_degree, postgrad_degree, user_avatar_link from user_biodata where user_id=$1';
        const response=await db.query(query,[userId]);
        if(response.rows.length==0){
            res.status(404).json({message:"User Profile Not Found"});
        }
        else{
            res.json(response.rows[0]);
        }
    }
    catch (error){
        console.log(error);
        res.status(500).json({message:"server error"});
    }
    
  };
  exports.setUserProfile = async (req, res) => {
    function toNullIfEmpty(value) {
        if (value === "" || value === undefined || value === null) return null;
        if (typeof value === "number" && (isNaN(value) || value === 0)) return null;
        return value;
    }
    try {
      const userId = req.user.id;
      console.log(req.user);
      const {
        firstname,
        lastname,
        age,
        male,
        city,
        state,
        country,
        tenthPercentage,
        twelfthPercentage,
        undergrad_cgpa,
        undergrad_institute,
        postgrad_cgpa,
        postgrad_institute,
        undergrad_degree,
        postgrad_degree,
      } = req.body;
  
      // Get files from req.files
      const pdfFile = req.files['pdfFile'] ? req.files['pdfFile'][0] : null;
      const imageFile = req.files['imageFile'] ? req.files['imageFile'][0] : null;
  
      if (!pdfFile) {
        return res.status(400).json({ error: 'Resume PDF file is required' });
      }
  
      // Create form for Voyage AI embed API (resume only)
      const form = new FormData();
      form.append('file', pdfFile.buffer, {
        filename: pdfFile.originalname,
        contentType: 'application/pdf',
      });
  
      const embedResponse = await axios.post(
        `${process.env.VOYAGE_AI_API}/embed-resume`,
        form,
        { headers: form.getHeaders() }
      );
      const resume_embed = embedResponse.data.embedding;
  
      // Upload PDF to Supabase Storage
      const pdfFileName = `resumes/${Date.now()}_${pdfFile.originalname}`;
      const { data: pdfData, error: pdfError } = await supabaseStorage
        .from(process.env.RESUME_BUCKET)
        .upload(pdfFileName, pdfFile.buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });
      if (pdfError) {
        console.error('Supabase PDF upload error:', pdfError);
        return res.status(500).json({ error: 'Failed to upload resume' });
      }
      const { data: pdfPublicUrlData } = await supabaseStorage.from(process.env.RESUME_BUCKET).getPublicUrl(pdfFileName);
      const resumeUrl = pdfPublicUrlData.publicUrl;
  
      // Upload image if present
      let imageUrl = null;
      if (imageFile) {
        const imageFileName = `images/${Date.now()}_${imageFile.originalname}`;
        const { data: imageData, error: imageError } = await supabaseStorage
          .from(process.env.USER_AVATAR_BUCKET)
          .upload(imageFileName, imageFile.buffer, {
            contentType: imageFile.mimetype,
            upsert: false,
          });
        if (imageError) {
          console.error('Supabase image upload error:', imageError);
          return res.status(500).json({ error: 'Failed to upload image' });
        }
        const { data: imagePublicUrlData } = await supabaseStorage.from(process.env.USER_AVATAR_BUCKET).getPublicUrl(imageFileName);
        imageUrl = imagePublicUrlData.publicUrl;
      }
      const resume_embed_string='['+resume_embed.join(',')+']';
      // Now save user profile data + resumeUrl + imageUrl + resume_embed to your DB if needed
      const insertQuery = `INSERT INTO user_biodata (
  user_id, firstname, lastname, age, male, city, state, country,
  "10th_percentage", "12_percentage", undergrad_cgpa, undergrad_institute,
  postgrad_cgpa, postgrad_institute, undergrad_degree, postgrad_degree,
  resume_link, user_avatar_link, resume_embed
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
  $11,$12,$13,$14,$15,$16,$17,$18,$19
)
`;
      console.log(userId);
      const values = [
        userId,
        toNullIfEmpty(firstname),
        toNullIfEmpty(lastname),
        toNullIfEmpty(Number(age)),
        toNullIfEmpty(male),
        toNullIfEmpty(city),
        toNullIfEmpty(state),
        toNullIfEmpty(country),
        toNullIfEmpty(Number(tenthPercentage)),
        toNullIfEmpty(Number(twelfthPercentage)),
        toNullIfEmpty(Number(undergrad_cgpa)),
        toNullIfEmpty(undergrad_institute),
        toNullIfEmpty(Number(postgrad_cgpa)),
        toNullIfEmpty(postgrad_institute),
        toNullIfEmpty(undergrad_degree),
        toNullIfEmpty(postgrad_degree),
        resumeUrl,
        imageUrl,
        resume_embed_string,
      ];
      
      await db.query(insertQuery, values);
      
      return res.status(200).json({
        message: 'Profile updated successfully',
       
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error creating profile' });
    }
  };
  exports.getEmployerProfile=async (req,res)=>{
        const employerId=req.user.id;
        try{
            const query='select * from employer_biodata where employer_id=$1';
            const response=await db.query(query,[employerId]);
            if(response.rows.length==0){
                res.status(404).json({message:"Employer Profile Not Found"});
            }
            else{
                res.json(response.rows[0]);
            }
        }
        catch(error){
            console.err(err);
            res.status(500).json({message:"server error"});

        }
  };
  exports.setEmployerProfile = async (req, res) => {
    try {
      const employerId = req.user.id;
  
      const {
        firstname,
        lastname,
        male,
        org,
        city,
        state,
        country,
      } = req.body;
  
      if (!firstname || !lastname || !org || !city || !state || !country) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const maleBool = male === 'true' || male === true;
  
      if (!req.file) {
        return res.status(400).json({ message: "Organization avatar image file is required" });
      }
  
      const file = req.file;
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      console.log("here");
      const { data: imageData, error } = await  supabaseStorage
        .from(`${process.env.EMPLOYER_AVATAR_BUCKET}`)
        .upload(filename, file.buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.mimetype,
        });
  
      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ message: "Failed to upload avatar image" });
      }
      console.log(filename);
      const { data:publicURLData, error: urlError } = await supabaseStorage
        .from(`${process.env.EMPLOYER_AVATAR_BUCKET}`)
        .getPublicUrl(filename);
  
      if (urlError) {
        console.error('Supabase getPublicUrl error:', urlError);
        return res.status(500).json({ message: "Failed to get avatar public URL" });
      }
      const publicUrl=publicURLData.publicUrl;
      // Simple insert query
      const query = `
        INSERT INTO employer_biodata (
          employer_id, firstname, lastname, male, org, org_avatar, city, state, country
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
      `;
  
      const values = [
        employerId,
        firstname,
        lastname,
        maleBool,
        org,
        publicUrl,
        city,
        state,
        country,
      ];
  
      const result = await db.query(query, values);
  
      res.status(201).json({
        message: "Employer profile created successfully",
        profile: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating profile" });
    }
  };
