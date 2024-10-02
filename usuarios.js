var array = [];
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")



class Usuarios{
    constructor(nome, email, senha, codigodeRecuperacao, tempodeRecuperacao){
        this.nome = nome;
        this.email = email
        this.senha = senha
        this.codigodeRecuperacao = codigodeRecuperacao
        this.tempodeRecuperacao = tempodeRecuperacao
    }

    async verificarValores() {
        const usuario = [this.nome, this.email, this.senha];
        for (var i = 0; i < usuario.length; i++) {
          if (usuario[i] == '' || usuario[i] === undefined) {
            return Promise.reject({err: "usuarios com dados invalidos"});
          }
        }

        try {
            await this.Crip(this.senha)
            this.AddToArray()
            return Promise.resolve(true); 
        } catch (error) {
            return Promise.reject(error)
        }

    }

    AddToArray(){
        array.push({nome: this.nome, email: this.email, senha: this.senha})
        console.log(array)
    }

    AllUsers(){
        return array
    }

    async Crip(){
        return new Promise((resolve, reject) => {
            bcrypt.hash(this.senha, 10, (err, hash) => {
                if(err){
                    reject({erro: err, status: false})
                }else{
                    this.senha = hash
                    resolve({erro: false, status: true})
                }
            })
        })
    }


    pesquisaEmail(){
        const usuarioEncontrado = array.find(usuario => usuario.email == this.email);
        if (usuarioEncontrado) {
           return Promise.resolve(usuarioEncontrado)

        } else {
            return Promise.reject({erro: "Usuario nao encontrado"});
        }
    }

    validarSenha(){

        return new Promise( async (resolve, reject) => {
            try {
                const {senha} = await this.pesquisaEmail();
                const email = this.email
                bcrypt.compare(this.senha, senha, function(err, result){
                    if (result) {
                        const token = jwt.sign({email: email}, process.env.SECRET, {expiresIn: '1h'})
                        resolve(token)
    
                    } else {
                        reject({err})
                    }
                })
    
            } catch (error) {
                reject(error)
            }
        })

    }

    atualizar(){
        const index = array.findIndex((email) => email == this.email)
        array[index].codigodeRecuperacao
        array[index].tempodeRecuperacao
        console.log(array)
        
    }

}

module.exports = Usuarios;