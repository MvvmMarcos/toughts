const express = require('express');
const exhbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('express-flash');
//conexão com o banco
const conn = require('./db/conn');
//models
const Tought = require('./models/Tought');
const User = require('./models/User');
//rotas
const toughtsRoutes = require('./routes/toughtsRoutes');
const authRoutes = require('./routes/authRoutes');
//importar a controller
const ToughtController = require('./controllers/ToughtController');

const app = express();
//configurações do handlebars
app.engine('handlebars', exhbs.engine());
//setar a engine
app.set('view engine', 'handlebars');
//arquivos estaticos
app.use(express.static('public'));
//ler arquivos do body
app.use(express.urlencoded({extended:true}));
app.use(express.json());
//session middleware
app.use(
    session({
        name:'session',
        secret:'nosso_secret',
        resave:false,
        saveUninitialized:false,
        store: new FileStore({
            logFn:function(){},
            path:require('path').join(require('os').tmpdir(),'sessions'),
        }),
        cookie:{
            secure:false,
            maxAge:86400000,
            expires: new Date(Date.now() + 86400000),
            httpOnly:true,
        }
    })
)
//flash messages
app.use(flash())
//set session to res
app.use((req, res, next)=>{
    if(req.session.userid){
        res.locals.session = req.session
    }
    next()
})
//rotas
app.use('/toughts', toughtsRoutes);
app.use('/', authRoutes);
app.use('/', ToughtController.showToughts);
conn
.sync()
// .sync({force:true})
.then(()=>{
    app.listen(3000)
})
.catch((err)=>console.log(err))
