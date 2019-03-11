import { h, render, Component } from 'preact'
import { connect } from 'socket.io-client'
const UUID = require('uuid/v1')

import { Trace, Error } from './log'
import { SERVER_DOMAIN, SERVER_PORT, CLIENT_PORT } from '../config'
import './index.css'

const PEER_CONNECTION_CONFIG =
{
    'iceServers':
    [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
}

class PeerGambler extends Component
{
    private socket = connect(`ws://${SERVER_DOMAIN}:${SERVER_PORT}/`, {transports: ['websocket']})
    private connection = new RTCPeerConnection(PEER_CONNECTION_CONFIG)
    private tableid = window.location.search.slice(1)
    private isdealer = this.tableid.length == 0
    private uuid = UUID()
    state = { url_broadcast: '' }

    constructor()
    {
        super()
        this.socket.on('connected', message =>
        {
            console.log(message)
            !this.isdealer && this.socket.send('f.' + this.tableid)
        })
        this.socket.on('message', message =>
        {
            Trace(message)
            if (message.startsWith('n.'))
			{
				const [_, uri] = message.split('.')
				const url = `http://${SERVER_DOMAIN}:${CLIENT_PORT}/?${uri}`
				this.setState({ url_broadcast: url })
            }
            else
            {
                const signal = JSON.parse(atob(message))
                console.log(signal)
                if (signal.sdp)
                {
                    this.connection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                        .then(evt =>
                        {
                            if (signal.sdp.type == 'offer')
                            {
                                this.connection.createAnswer().then(description => this.CreatedDescription(description))
                            }
                        })
                }
                // else
                // if (signal.ice)
                // {
                //     this.connection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler)
                // }
            }
        })

        this.connection.onicecandidate = event =>
        {
            Trace('onicecandidate')
            if (event.candidate != null)
            {
                Trace('onicecandidate 1')
                this.socket.send('w.' + JSON.stringify({'ice': event.candidate, 'uuid': this.uuid}))
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
        if (this.isdealer)
        {
            this.socket.send('n')
            this.connection.createOffer().then(description => this.CreatedDescription(description))
        }
    }

    CreatedDescription(description: RTCSessionDescriptionInit)
    {
        this.connection.setLocalDescription(description).then(evt =>
        {
            this.socket.send('w.' + btoa(JSON.stringify(
            {
                'sdp': this.connection.localDescription,
                'uuid': this.uuid,
            })))
        })
    }

    componentDidMount()
    {
        if (!this.isdealer)
            return
        
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
                <div id='broadcast' style={{ display: this.isdealer ? 'block' : 'none' }}>
                    <input type='button' value='Broadcast' id='btn_broadcast'></input>
                    <input type='text' value={this.state.url_broadcast} size={50} id='url_broadcast' disabled></input>
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
