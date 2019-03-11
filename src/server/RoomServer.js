const UUID = require('node-uuid')
const Identifier =
{
    // https://stackoverflow.com/questions/1073956/how-to-generate-63-million-prize-codes
    get random()
    {
        return [...Array(6)].reduce(code => code + '0123456789ABDEFGHJKLMNPRSTUVXYZ'[~~(Math.random() * 31)], '')
    }
}
class RoomServer
{
    constructor()
    {
        this.games = {}
        this.game_count = 0

        this.fake_latency = 100
        this.local_time = 0
        this.lastTimestamp = new Date().getTime()

        // a local queue of messages we delay if faking latency
        this.messages = []
        this.playerUpdateMessage = [];
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
                client.game && client.game.player_host.send(msg)
                break
            }
        }
    }

    OnInput(client, parts)
    {
         // The input commands come in like u-l,
        // so we split them up into separate commands,
        // and then update the players
        let input_commands = parts[1].replace(/\,/g, '.').split(':')
        let input_time = parts[2].replace('-', '.')
        let input_seq = parts[3]

        // the client should be in a game, so
        // we can tell that game to handle the input
        if (client && client.game && client.game.gamecore)
        {
            client.game.gamecore.HandleInput(client, input_commands, input_time, input_seq)
        }
    }

    CreateGame(player)
    {
        let thegame =
        {
            id: Identifier.random,
            player_host: player,
            player_client: null,
            player_count: 1,
        }

        this.games[thegame.id] = thegame
        this.game_count++

        player.game = thegame
        player.hosting = true
        player.send(`n.${thegame.id}`)
        console.log(`Create game ${thegame.id}`)
        return thegame
    }

    EndGame(gameid, userid)
    {
        let thegame = this.games[gameid]
        if (thegame)
        {
            if (userid == thegame.player_host.userid)
            {
                thegame.player_client && thegame.player_client.send('s.e')
                console.log(`Close game ${gameid}`)
                delete this.games[gameid]
                this.game_count--
            }
            else
            {
                if (thegame.player_host)
                {
                    thegame.player_host.send('s.e')
                    thegame.player_count--
                }
            }
        }
        else
        {
            console.log('that game was not found!')
        }
    }

    StartGame(game)
    {
        console.log('Start game ' + game.id)
        // right so a game has 2 players and wants to begin
        // the host already knows they are hosting,
        // tell the other client they are joining a game
        // s=server message, j=you are joining, send them the host id
        game.player_client.send('s.j.' + game.player_host.userid)
        game.player_client.game = game

        // now we tell both that the game is ready to start
        // clients will reset their positions in this case.
        game.player_client.send('s.r.'+ String(this.local_time).replace('.','-'))
        game.player_host.send('s.r.'+ String(this.local_time).replace('.','-'))
 
        // set this flag, so that the update loop can run it.
        game.active = true
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
module.exports = new RoomServer()
