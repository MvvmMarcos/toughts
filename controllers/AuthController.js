const User = require('../models/User');
const bcrypt = require('bcryptjs');
module.exports = class AuthController {
    static login(req, res){
        
        res.render('auth/login');
    }
    static async loginPost(req, res){
        const {email, password} = req.body;
        //find user
        const user = await User.findOne({where:{email:email}});
        if(!user){
            req.flash('message','Usuário não encontrado!');
            res.render('auth/login');
            return;
        }
        //check if passwoars match
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if(!passwordMatch){
            req.flash('message','Usuário ou senha incorretos!');
            res.render('auth/login');
            return;
        }
        req.session.userid = user.id
            req.flash('message','Login realizado com sucesso!');
            req.session.save(()=>{
                res.redirect('toughts/dashboard');
            })
       
    }
    static register(req, res){
        res.render('auth/register');
    }
    static async registerPost(req, res){
        const {name, email, password, confirmpassword} = req.body;
        //validações 
        if(name == ""){
            req.flash('message','Por favor, preencha o campo nome!');
            res.render('auth/register');
            return;
        }
        if(email == ""){
            req.flash('message','Por favor, preencha o campo e-mail!');
            res.render('auth/register');
            return;
        }
        //check if user exists
        const checkIfUserExists = await User.findOne({where:{email:email}});
        if(checkIfUserExists){
            req.flash('message','O e-mail já está em uso!');
            res.render('auth/register');
            return;
        }
        if(password == ""){
            req.flash('message','Por favor, preencha o campo senha!');
            res.render('auth/register');
            return;
        }
        if(confirmpassword == ""){
            req.flash('message','Por favor, preencha o campo confirme a senha!');
            res.render('auth/register');
            return;
        }
        if(password != confirmpassword){
            req.flash('message','As senhas não conferem, tente novamente!');
            res.render('auth/register');
            return;
        }
        //create a password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = {
            name,
            email,
            password:hashedPassword
        }
        try {
            const createduser = await User.create(user);
            //inicializar a sessao
            req.session.userid = createduser.id
            req.flash('message','Cadastro realizado com sucesso!');
            req.session.save(()=>{
                res.redirect('/');
            })
        } catch (error) {
            console.log(error)
        }
    }
    static logout(req, res){
        req.session.destroy();
        res.redirect('/login');
    }
}