import { h, render, Component } from 'preact'
import RTCMediaStream from './rtc-media-stream'
require('./main.css')
// require('./main.js')

class App extends Component
{
    render()
    {
        return (
            <div id="container">
                <p>Check out the complete set of WebRTC demos at <a href="https://webrtc.github.io/samples/" title="WebRTC samples GitHub Pages">webrtc.github.io/samples</a>.</p>
            
                <video id="localVideo" autoplay muted></video>
                <video id="remoteVideo" autoplay></video>
            
                <div>
                <button id="startButton">Start</button>
                <button id="callButton">Call</button>
                <button id="hangupButton">Hang Up</button>
                </div>
            
                <p>View the console to see logging. The <code>MediaStream</code> object <code>localStream</code>, and the <code>RTCPeerConnection</code> objects <code>localPeerConnection</code> and <code>remotePeerConnection</code> are in global scope, so you can inspect them in the console as well.</p>
            
                <p>For more information about RTCPeerConnection, see <a href="https://www.html5rocks.com/en/tutorials/webrtc/basics/" title="HTML5 Rocks article about WebRTC by Sam Dutton">Getting Started With WebRTC</a>.</p>
            
                <a href="https://github.com/samdutton/simpl/blob/gh-pages/rtcpeerconnection" title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
            </div>
        )
    }
}

window.main = _ =>
{
    render(<App />, document.body)
}
