const Tought = require('../models/Tought');
const User = require('../models/User');

module.exports = class ToughtController {

    static async showToughts(req, res) {
        // const toughts = await Tought.findAll({raw:true});
        //ou

        const toughtsData = await Tought.findAll({
            include:User,
        });
        // const toughts = toughtsData.map((result)=> result.dataValues);
        const toughts = toughtsData.map((result)=> result.get({plain:true}));
        res.render('toughts/home' , {toughts})
    }
    static createTought(req, res) {
        res.render('toughts/create');
    }
    static async createToughtSave(req, res) {
        const title = req.body.title;
        if (title == "") {
            req.flash('message', 'Precisa preencher o campo pensamento!');
            res.render('toughts/create');
            return;
        }
        const tought = {
            title,
            UserId: req.session.userid
        }

        try {
            await Tought.create(tought);
            req.flash('message', 'Pensamento criado com sucesso!');
            req.session.save(() => {
                res.redirect('/toughts/dashboard');
            })
        } catch (error) {
            console.log('Aconteceu um erro: ' + error);
        }

    }
    static async dashboard(req, res) {
        const userId =req.session.userid;
        //verificar se o usuário existe
        const user = await User.findOne({
            where:{
                id:userId
            },
            include:Tought,
            plain:true
        })
        //check is user exists
        if(!user){
            res.redirect('/login');
        }
        const toughts = user.Toughts.map((result)=>result.dataValues);
        let emptyToughts = false;
        if(toughts.length === 0){
            emptyToughts = true;
        }
        // console.log(toughts);
        res.render('toughts/dashboard',{toughts, emptyToughts});
    }
    //remover pensamentos
    static async removeTought(req, res){
        const id = req.body.id;
        const UserId = req.session.userid;
        try {
            await Tought.destroy({where:{id:id, UserId:UserId}});
            req.flash('message', 'Pensamento apagado com sucesso!');
            req.session.save(() => {
                res.redirect('/toughts/dashboard');
            })
        } catch (error) {
            console.log('Houve um erro ao tentar deletar pensamento: '+ error);
        }

    }
    //editar pensamentos
    static async updateTought(req, res){
        const id = req.params.id;
        const tought = await Tought.findOne({raw:true,where:{id:id}})
        res.render('toughts/edit', {tought});
    }
    //atualizando o pensamento
    static async updateToughtSave(req, res){
        const id = req.body.id;
        const tought = {
            title:req.body.title
        }
        try {
            await Tought.update(tought,{where:{id:id}});
            req.flash('message', 'Pensamento atualizado com sucesso!');
            req.session.save(()=>{
                res.redirect('/toughts/dashboard');
            })
        } catch (error) {
            console.log('Erro ao atualizar o pensamento: ' + error)
        }
    }

}