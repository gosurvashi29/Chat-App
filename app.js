
const express= require("express");
const path = require("path")
const bodyParser= require("body-parser")
const sequelize= require("./util/database")
const userRoutes= require("./routes/userRouter")
const passwordRoutes= require("./routes/passwordRoutes")
const userController= require("./controllers/userController")
//const expenseRoutes = require('./routes/expenseRoutes');
const User = require("./models/userModel")
//const Order = require("./models/orderModel")
//const ForgotPasswordRequest= require("./models/ForgotPasswordRequest")
//const Expense= require("./models/expense")
const paymentRoutes = require('./routes/paymentRoutes');

const premiumFeatureRoutes = require('./routes/premiumFeature')
const fetch = require("node-fetch"); // For making API calls


const app=express();

var cors= require("cors");


app.use(cors({
    origin: "*",  // Allow all origins 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow all methods 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  }));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,"Public"))); 

//User.hasMany(Expense); // One to Many Relationship 
//Expense.belongsTo(User);

//User.hasMany(Order);
//Order.belongsTo(User);



app.use("/user",userRoutes); 
//app.use("/user",expenseRoutes); 
//app.use("/api",expenseRoutes);
app.use('/api', paymentRoutes); 
app.use('/premium', premiumFeatureRoutes)
app.use("/password",passwordRoutes)


//serving html files



 app.get('*', (req, res) => {
    const requestedUrl = req.url;
    console.log('Requested URL:', requestedUrl);
    console.log('Current directory:', __dirname);

    if (requestedUrl.startsWith('/views/')) {
        
        const filePath = path.join(__dirname, 'views', requestedUrl.slice(7)+'.html');
        console.log('Serving file from path:', filePath);

        
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving file:', err); 
                res.status(404).send('File Not Found');
            }
        });
    } 
    
    else{
        
        if(requestedUrl.startsWith('/css/')) {
        
        const publicPath = path.join(__dirname, 'Public', requestedUrl+'.css'); 
        console.log('Serving file from path:', publicPath);
        res.sendFile(publicPath, (err) => { 
            
            if (err) {
                console.error('Error serving file:', err); 
                res.status(404).send('File Not Found');
            }
        });  
    }
    else {
        
        const publicPath = path.join(__dirname, 'Public','js', requestedUrl+'.js');
        console.log('Serving file from path:', publicPath);
        res.sendFile(publicPath, (err) => {
            
            if (err) {
                console.error('Error serving file:', err); 
                res.status(404).send('File Not Found');  
            }
        });  
    }
}
});

//C:\SharpenerProjects\Expense tracker Mobile and Web Application-AWS\Public\js\buyPremium.js
sequelize
.sync({force:false})
.then(result=>{
    console.log('Database synced!'); 
    app.listen(process.env.PORT || 3000,()=>{console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`)});
})
.catch(err=>{
    console.log(err) 
}); 