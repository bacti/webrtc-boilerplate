import { h, render, Component } from 'preact'
import { Trace } from './log'
import './index.css'

class PeerGambler extends Component
{
    constructor()
    {
        super()
    }

    render()
    {
        return (
            <div id='container'>
                <video id='localVideo' muted autoPlay>
                    <source src='https://www.w3schools.com/html/mov_bbb.mp4' type='video/mp4' />
                </video>
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
    Trace('bacti')
    render(<PeerGambler />, document.body)
}
