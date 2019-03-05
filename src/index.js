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
        this.startButton.disabled = true
        navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(stream =>
        {
            Trace('Received local stream')
            this.localVideo.srcObject = stream
            // localStream = stream
            this.callButton.disabled = false
        })
        .catch(e => alert('getUserMedia() error: ' + e.name))
    }

    Call()
    {
        this.callButton.disabled = true
        this.hangupButton.disabled = false
        Trace('Starting call')
        this.startTime = window.performance.now()

        const videoTracks = localStream.getVideoTracks()
        videoTracks.length > 0 && Trace('Using video device: ' + videoTracks[0].label)
        const audioTracks = localStream.getAudioTracks()
        audioTracks.length > 0 && Trace('Using audio device: ' + audioTracks[0].label)
    
        var servers = null
        pc1 = new RTCPeerConnection(servers)
        Trace('Created local peer connection object pc1')
        pc1.onicecandidate = e => onIceCandidate(pc1, e)

        pc2 = new RTCPeerConnection(servers)
        Trace('Created remote peer connection object pc2')
        pc2.onicecandidate = e => onIceCandidate(pc2, e)

        pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e)
        pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e)

        pc2.onaddstream = gotRemoteStream

        pc1.addStream(localStream)
        Trace('Added local stream to pc1')

        Trace('pc1 createOffer start')
        pc1.createOffer(offerOptions).then(onCreateOfferSuccess, onCreateSessionDescriptionError)
    }

    Ref(ref, object)
    {
        this[ref] = object
    }

    componentDidMount()
    {
        this.callButton.disabled = true
        this.hangupButton.disabled = true
        this.startButton.onclick = _ => this.Start()
        callButton.onclick = _ => this.Call()
        // hangupButton.onclick = hangup

        this.localVideo.addEventListener('loadedmetadata', function()
        {
            Trace(`Local video videoWidth: ${this.videoWidth}px, videoHeight: ${this.videoHeight}px`)
        })

        this.remoteVideo.addEventListener('loadedmetadata', function()
        {
            Trace(`Remote video videoWidth: ${this.videoWidth}px, videoHeight: ${this.videoHeight}px`)
        })
        this.remoteVideo.onresize = evt =>
        {
            Trace(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`)
            // We'll use the first onsize callback as an indication that video has started
            // playing out.
            if (this.startTime)
            {
                const elapsedTime = window.performance.now() - this.startTime
                Trace('Setup time: ' + elapsedTime.toFixed(3) + 'ms')
                this.startTime = null
            }
        }
    }

    render()
    {
        return (
            <div id='container'>
                <p>Check out the complete set of WebRTC demos at <a href='https://webrtc.github.io/samples/' title='WebRTC samples GitHub Pages'>webrtc.github.io/samples</a>.</p>

                <video ref={el => this.Ref('localVideo', el)} id='localVideo' autoplay muted></video>
                <video ref={el => this.Ref('remoteVideo', el)} id='remoteVideo' autoplay></video>

                <div>
                <button ref={el => this.Ref('startButton', el)} id='startButton'>Start</button>
                <button ref={el => this.Ref('callButton', el)} id='callButton'>Call</button>
                <button ref={el => this.Ref('hangupButton', el)} id='hangupButton'>Hang Up</button>
                </div>

                <p>View the console to see logging. The <code>MediaStream</code> object <code>localStream</code>, and the <code>RTCPeerConnection</code> objects <code>localPeerConnection</code> and <code>remotePeerConnection</code> are in global scope, so you can inspect them in the console as well.</p>

                <p>For more information about RTCPeerConnection, see <a href='https://www.html5rocks.com/en/tutorials/webrtc/basics/' title='HTML5 Rocks article about WebRTC by Sam Dutton'>Getting Started With WebRTC</a>.</p>

                <a href='https://github.com/samdutton/simpl/blob/gh-pages/rtcpeerconnection' title='View source for this page on GitHub' id='viewSource'>View source on GitHub</a>
            </div>
        )
    }
}

window.main = _ =>
{
    render(<App />, document.body)
}
