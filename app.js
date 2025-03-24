
const express= require("express");
const http = require("http")
const path = require("path")
const socketIo = require('socket.io');
const bodyParser= require("body-parser")
const sequelize= require("./util/database")
const jwt = require('jsonwebtoken');
const userRoutes= require("./routes/userRouter")
const chatRoutes= require("./routes/chatRoutes")
const groupRoutes= require("./routes/groupRoutes")
const userController= require("./controllers/userController")
const User = require("./models/userModel")
const fetch = require("node-fetch"); // For making API calls


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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
app.use("/chat",chatRoutes);
app.use('/groups', groupRoutes);

// Initialize socket handling
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);
        io.emit('message', data); // Emit to all connected clients
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
    });
});



//serving html files 



 app.get('*', (req, res) => {
    const requestedUrl = req.url;
    console.log('Requested URL:', requestedUrl);
    console.log('Current directory:', __dirname);

    if (requestedUrl.startsWith('/socket.io/')) {
        return;
        
    }

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

sequelize
.sync({force:false})
.then(result=>{
    console.log('Database synced!'); 
    app.listen(process.env.PORT || 3000,()=>{console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`)});
})
.catch(err=>{
    console.log(err) 
}); 