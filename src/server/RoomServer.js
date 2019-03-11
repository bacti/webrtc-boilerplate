const Identifier =
{
    // https://stackoverflow.com/questions/1073956/how-to-generate-63-million-prize-codes
    get random()
    {
        return [...Array(16)].reduce(code => code + '0123456789ABDEFGHJKLMNPRSTUVXYZ'[~~(Math.random() * 31)], '')
    }
}
const MAX_PLAYER = 4

module.exports = new class RoomServer
{
    constructor()
    {
        this.games = {}
        this.game_count = 0

        this.local_time = 0
        this.lastTimestamp = new Date().getTime()

        this.messages = []
        setInterval(evt =>
        {
            let dt = new Date().getTime() - this.lastTimestamp
            this.lastTimestamp = new Date().getTime()
            this.local_time += dt / 1000.0
        }, 4)
    }

    OnMessage(client, message)
    {
        this.OnMessageImpl(client, message)
    }
    
    OnMessageImpl(client, msg)
    {
        let [message_type, message] = msg.split('.')
        switch (message_type)
        {
            case 'n':
            {
                this.CreateGame(client)
                break
            }
            case 'f':
            {
                this.FindGame(client, message)
                break
            }
            case 'hw':
            {
                this.HostDesc(client, message)
                break
            }
            case 'w':
            {
                this.PeerService(client, message)
                break
            }
            default:
            {
                console.log(msg)
                break
            }
        }
    }

    CreateGame(client)
    {
        const game =
        {
            id: Identifier.random,
            host: client,
            players: [ client ],
        }

        this.games[game.id] = game
        this.game_count++

        client.game = game
        client.host = true
        client.send(`n.${game.id}`)
        console.log(`Create game ${game.id}`)
    }

    FindGame(client, uri)
    {
        console.log('Find game ' + uri)
        const game = this.games[uri]
        if (!game || game.players.length >= MAX_PLAYER)
            return client.send('s.u') // unavailable

        game.players.push(client)
        client.game = game
        client.send(game.host_desc)
    }

    HostDesc(client, message)
    {
        const { game } = client
        game.host_desc = message
    }

    PeerService(client, message)
    {
        const { game } = client
        game.players.forEach(client => client.send(message))
    }
}
