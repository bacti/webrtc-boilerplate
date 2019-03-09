const PATH = require('path')
const FS = require('fs-extra')
const EventEmitter = require('./EventEmitter')
const express = require('express')
const http = require('http')
const Config = require('../../config')

const RELEASE = PATH.join(process.cwd(), 'dist')

class Server extends EventEmitter
{
    constructor()
    {
        super()
        if (FS.existsSync(RELEASE))
        {
            const app = express()
            http.Server(app).listen(Config.CLIENT_PORT)
            app.use((req, res, next) =>
            {
                res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
                next()
            })
            app.use('/', express.static(RELEASE))
        }

        const handler = http.createServer()
        handler.listen(Config.SERVER_PORT, evt => console.log(`Listening on ${Config.SERVER_PORT}`))
        let sio = require('socket.io')(handler, {transports: ['websocket']})
        sio.on('connection', client => this.emit('connection', client))
    }
}
module.exports = new Server()
