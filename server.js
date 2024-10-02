
const express = require("express");
const server = express()
const port = 8080;

const bodyParser = require('body-parser');
const crypto = require('crypto')

require('dotenv').config()
const cors = require("cors");
server.use(cors());
const jwt = require("jsonwebtoken")



server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

const Cookies = require('js-cookie');
const Usuarios = require('./usuarios');

function verificarToken(req, res, next) {
    const auth = req.headers['authorization']
    const tokenRecuperado = auth && auth.split(' ')[1]; // Capturando o token do cabeçalho

    if (!tokenRecuperado) {
      return res.status(403).json({ mensagem: 'Token não fornecido' });
    }
  
    jwt.verify(tokenRecuperado, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ mensagem: 'Token inválido' });
      }

      req.usuario = decoded;
      next();
    });
  }

server.get('/', (req, res) => {
    res.sendStatus(200).send("OK")
});

server.post('/cadastro', async (req, res) => {
    var novoUsuario = new Usuarios(req.body.nome, req.body.email, req.body.senha);
    try {
        await novoUsuario.verificarValores()
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

server.post('/login', async (req, res) => {

    if(req.body.email == undefined || req.body.senha == undefined){
        res.send("Falta de informacoes")
    }

    try {
        const pesquisaUsuario = new Usuarios(false, req.body.email, req.body.senha)
        const token = await pesquisaUsuario.validarSenha()
        Cookies.set('token', token, { secure: true, httpOnly: true })
        res.json(token)
    } catch (error) {
        res.json({error})
    }

})

server.get('/esqueciMinhaSenha', async (req, res) =>{

    try {
        
        const email = req.body.email
        Usuarios.prototype.pesquisaEmail(email).then(response => {
            if(response){
               const token = crypto.randomBytes(20).toString('hex')
               const tokenExperesIn = new Date()
                tokenExperesIn.setHours = (tokenExperesIn.getHours() + 1)

                const update = new Usuarios('', email, '', token, tokenExperesIn)
                update.atualizar()

                req.send("ok")

            }
        }).catch(erro =>{
            console.log(erro)
            res.send("erro")
        })

    } catch (error) {
        res.sendStatus(500).send("erro na pagina de recuperacao de senha, tente novamente")
    }

})

server.get('/home', verificarToken, (req, res) => {
    res.sendStatus(200).send("Acessado")
})


server.get('/users', (req, res) => {
    const AllUsers = new Usuarios
    res.json(AllUsers.AllUsers())
})

server.listen(port, () =>{
    console.log("Server OK, port: " + port );
})