require('dotenv').config();
const express=require('express');
const app=express();
const PORT=process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRoutes=require('./routes/authRoutes.js');
const profileRoutes=require('./routes/profileRoutes.js');
app.use('/api/auth',authRoutes);
app.use('/api/profile',profileRoutes);
app.get('/',(req,res)=>{
    res.send({message:"API IS ONLINE"});

});
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
  
app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);

})

