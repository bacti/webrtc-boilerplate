import { h, render, Component } from 'preact'
import { Trace } from './log'

class Hello extends Component
{
    constructor()
    {
        super()
    }

    render()
    {
        return (
            <div id='container'>
                <video id='localVideo' muted={true}></video>
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
    render(<Hello />, document.body)
}
