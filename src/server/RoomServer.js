const Identifier =
{
    // https://stackoverflow.com/questions/1073956/how-to-generate-63-million-prize-codes
    get random()
    {
        return [...Array(16)].reduce(code => code + '0123456789ABDEFGHJKLMNPRSTUVXYZ'[~~(Math.random() * 31)], '')
    }
}
module.exports = new class RoomServer
{
    constructor()
    {
        this.games = {}
        this.game_count = 0

        this.fake_latency = 100
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
        if (this.fake_latency > 0)
        {
            this.messages.push({client: client, message: message})
            setTimeout(evt =>
            {
                if (this.messages.length)
                {
                    this.OnMessageImpl(this.messages[0].client, this.messages[0].message)
                    this.messages.splice(0, 1)
                }
            }, this.fake_latency)
        }
        else
        {
            this.OnMessageImpl(client, message)
        }
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
            default:
            {
                console.log(msg)
                client.game && client.game.host.send(msg)
                break
            }
        }
    }

    CreateGame(player)
    {
        const game =
        {
            id: Identifier.random,
            host: player,
            players: [],
        }

        this.games[game.id] = game
        this.game_count++

        player.game = game
        player.send(`n.${game.id}`)
        console.log(`Create game ${game.id}`)
    }

    FindGame(player, uri)
    {
        console.log('Find game ' + uri)
        let game_instance = this.games[uri]
        if (game_instance)
        {
            if (game_instance.player_count < 2)
            {
                game_instance.player_client = player
                game_instance.player_count++
                this.StartGame(game_instance)
                return
            }
            player.send('s.u') // unavailable
        }
    }
}
