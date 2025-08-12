require('dotenv').config();
const express=require('express');
const {startPing}=require('./utils/ping.js');
const PING_URL=process.env.VOYAGE_AI_API;
startPing(PING_URL,10);

const app=express();
const PORT=process.env.PORT;
const HOST='0.0.0.0';
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRoutes=require('./routes/authRoutes.js');
const profileRoutes=require('./routes/profileRoutes.js');
const jobRoutes=require('./routes/jobRoutes.js');
app.use('/api/auth',authRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/jobs',jobRoutes);
app.get('/',(req,res)=>{
    res.send({message:"API IS ONLINE"});

});
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

  
app.listen(PORT,HOST,()=>{
    console.log(`Server running on Port ${PORT}`);

});

