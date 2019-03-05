import { h, render, Component } from 'preact'
import RTCMediaStream from './rtc-media-stream'
import { Trace } from './log'
require('./main.css')
// require('./main.js')

class App extends Component
{
    Start()
    {
        Trace('Requesting local stream')
        const startButton = document.getElementById('startButton')
        const callButton = document.getElementById('callButton')
        startButton.disabled = true
        navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(stream =>
        {
            Trace('Received local stream')
            this.localVideo.srcObject = stream
            // localStream = stream
            callButton.disabled = false
        })
        .catch(e => alert('getUserMedia() error: ' + e.name))
    }

    componentDidMount()
    {
        const startButton = document.getElementById('startButton')
        const callButton = document.getElementById('callButton')
        const hangupButton = document.getElementById('hangupButton')
        callButton.disabled = true
        hangupButton.disabled = true
        startButton.onclick = _ => this.Start()
        // callButton.onclick = call
        // hangupButton.onclick = hangup

        this.localVideo.addEventListener('loadedmetadata', function()
        {
            Trace(`Local video videoWidth: ${this.videoWidth}px, videoHeight: ${this.videoHeight}px`)
        })

        const remoteVideo = document.getElementById('remoteVideo')
        remoteVideo.addEventListener('loadedmetadata', function()
        {
            Trace(`Remote video videoWidth: ${this.videoWidth}px, videoHeight: ${this.videoHeight}px`)
        })
        remoteVideo.onresize = evt =>
        {
            Trace(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`)
            // We'll use the first onsize callback as an indication that video has started
            // playing out.
            if (startTime)
            {
                const elapsedTime = window.performance.now() - startTime
                Trace('Setup time: ' + elapsedTime.toFixed(3) + 'ms')
                startTime = null
            }
        }
    }

    render()
    {
        return (
            <div id="container">
                <p>Check out the complete set of WebRTC demos at <a href="https://webrtc.github.io/samples/" title="WebRTC samples GitHub Pages">webrtc.github.io/samples</a>.</p>

                <video ref={video => (this.localVideo = video)} id="localVideo" autoplay muted></video>
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
