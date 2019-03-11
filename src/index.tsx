import { h, render, Component } from 'preact'
import { connect } from 'socket.io-client'
import { Trace, Error } from './log'
import { SERVER_DOMAIN, SERVER_PORT } from '../config'
import './index.css'

const PEER_CONNECTION_CONFIG =
{
    'iceServers':
    [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
}

const Identifier =
{
    get random()
    {
        return [...Array(6)].reduce(code => code + '0123456789ABDEFGHJKLMNPRSTUVXYZ'[~~(Math.random() * 31)], '')
    }
}

class PeerGambler extends Component
{
    private socket = connect(`ws://${SERVER_DOMAIN}:${SERVER_PORT}/`, {transports: ['websocket']})
    private connection = new RTCPeerConnection(PEER_CONNECTION_CONFIG)

    constructor()
    {
        super()
        this.socket.on('connected', message => console.log(message))
        this.connection.onicecandidate = event =>
        {
            if (event.candidate != null)
            {
                this.socket.send(JSON.stringify({ 'ice': event.candidate, 'uuid': Identifier.random }))
            }
        }
        this.connection.ontrack = event =>
        {
            const video_streaming = document.getElementById('video_streaming') as HTMLMediaElement
            video_streaming.srcObject = event.streams[0]
        }
    }

    Start()
    {
        // peerConnection = new RTCPeerConnection(PeerConnectionConfig);
        // peerConnection.onicecandidate = gotIceCandidate;
        // peerConnection.ontrack = gotRemoteStream;
        // this.connection.addTrack(track)
      
        // if(isCaller) {
        //   peerConnection.createOffer().then(createdDescription).catch(errorHandler);
        // }
    }

    componentDidMount()
    {
        const btn_broadcast = document.getElementById('btn_broadcast') as HTMLInputElement
        btn_broadcast.addEventListener('click', (evt: Event) =>
        {
            btn_broadcast.disabled = true
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream =>
            {
                const video_streaming = document.getElementById('video_streaming') as HTMLMediaElement
                video_streaming.srcObject = stream
                this.Start()
            })
            .catch(error => Error('getUserMedia() error: ' + error.name))
        })
    }

    render()
    {
        return (
            <div id='container'>
                <video id='video_streaming' muted autoPlay />
                <div id='broadcast'>
                    <input type='button' value='Broadcast' id='btn_broadcast'></input>
                    <input type='text' value='' id='url_broadcast' disabled></input>
                </div>
            </div>
        )
    }
}

declare global
{
    interface Window { main: any }
}

window.main = () =>
{
    Trace('blackjack-online')
    render(<PeerGambler />, document.body)
}
