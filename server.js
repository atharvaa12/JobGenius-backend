const express=require('express');
require('dotenv').config();

const app=express();
const PORT=process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRoutes=require('./routes/authRoutes.js');
app.use('/auth',authRoutes);
app.get('/',(req,res)=>{
    res.send({message:"API IS ONLINE"});

});
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
  
app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);

})

