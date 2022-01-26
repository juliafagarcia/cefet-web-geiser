// importação de dependência(s)
import { readFile } from 'fs/promises'
import express from 'express'
const app = express()

// variáveis globais deste módulo
const __dirname = './client'
const PORT = 3000
let db = {}

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
try {
    const jogadores = await readFile('./server/data/jogadores.json')
    const jogosPorJogador = await readFile('./server/data/jogosPorJogador.json')
    
    db = Object.assign({}, JSON.parse(jogadores.toString("utf8")), JSON.parse(jogosPorJogador.toString("utf8")))
} catch (err) {
    console.error(err);
}

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set('view engine', 'hbs')
app.set('views', 'server/views')

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get('/', (req, res) => {
    res.render('index', db)  
})

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
const profile = id => {
    return db.players.find(player => player.steamid === id)
}

const jogosFavoritos = id => {
    return db[`${id}`].games.sort((a, b) => (b.playtime_forever - a.playtime_forever)).slice(0, 5)
}

const jogosNaoJogados = id => {
    return db[`${id}`].games.filter(e => e.playtime_forever === 0)
}

const convertMinToHours = min => {
    return `${ Math.round(min / 60) }h`
}

const updatedFieldToHours = arr => {
    return arr.map((item) => ({ ...item, playtime_forever:  convertMinToHours(item.playtime_forever)}))
}

app.get('/jogador/:id', (req, res) => {
    const listaFavoritos = updatedFieldToHours(jogosFavoritos(req.params.id))

    res.render('jogador', { 
        profile: profile(req.params.id), 
        gameInfo: listaFavoritos, 
        calculados: { 
            favorito: listaFavoritos[0], 
            qtdJogos: db[`${req.params.id}`].game_count,
            jogosNaoJogados: jogosNaoJogados(req.params.id).length
        }
    })
})

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static(`${__dirname}`))

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {
    console.log(`Escutando em: http://localhost:${PORT}`)
})
