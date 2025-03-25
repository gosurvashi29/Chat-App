
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
const upload = require("./middleware/upload");
const multer= require("multer")
const fetch = require("node-fetch"); // For making API calls


const app = express();
/*

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      
      return cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
  
  const upload = multer({ storage: storage })
*/
const server = http.createServer(app);
server.listen(9000,()=> console.log(`Server is running on http://localhost:${process.env.PORT || 9000}`))

const { Server } = require("socket.io");
const io = new Server(server); // io will handle all our sockets and express will handle http requests
// lets handle socket.io
io.on('connection',socket=>{    // as soon as socket connection is build with a client or user, with a unique id
    console.log("A new user connected:",socket.id)
    socket.on("user-message",(message)=>{
        io.emit("message", message);
    })
    
}) 

 
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});


var cors= require("cors");
 

app.use(cors({
    origin: "*",  // Allow all origins 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow all methods 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  })); 


app.use(bodyParser.json());
app.use(express.urlencoded({extended: false})); 
app.use(express.static(path.join(__dirname,"Public"))); 




app.use("/user",userRoutes);  
app.use("/chat",chatRoutes);
app.use('/groups', groupRoutes);
//app.use("/upload", upload,groupRoutes)
app.post('/upload', upload, (req, res) => {
    
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    res.status(200).json({
        message: 'File uploaded successfully!',
        file: req.file 
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