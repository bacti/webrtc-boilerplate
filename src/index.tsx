import { h, render, Component } from 'preact'
import { Trace } from './log'
import './index.css'

class PeerGambler extends Component
{
    constructor()
    {
        super()
    }

    componentDidMount()
    {
        const video_streaming = document.getElementById('video_streaming') as HTMLMediaElement
        const btn_broadcast = document.getElementById('btn_broadcast') as HTMLInputElement
        btn_broadcast.addEventListener('click', (evt: Event) =>
        {
            btn_broadcast.disabled = true
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream =>
            {
                Trace('Received local stream')
                video_streaming.srcObject = stream
            })
            .catch(error => alert('getUserMedia() error: ' + error.name))
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
