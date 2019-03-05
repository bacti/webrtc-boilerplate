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
            this.localStream = stream
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

        const videoTracks = this.localStream.getVideoTracks()
        videoTracks.length > 0 && Trace('Using video device: ' + videoTracks[0].label)
        const audioTracks = this.localStream.getAudioTracks()
        audioTracks.length > 0 && Trace('Using audio device: ' + audioTracks[0].label)
    
        var servers = null

        Trace('Created local peer connection object pc1')
        let pc1 = new RTCMediaStream('pc1', servers)
        Trace('Created remote peer connection object pc2')
        let pc2 = new RTCMediaStream('pc2', servers)

        pc1.SetPeer(pc2)
        pc2.SetPeer(pc1)

        pc2.onaddstream = evt =>
        {
            Trace('pc2 received remote stream')
            this.remoteVideo.srcObject = evt.stream
        }

        Trace('Added local stream to pc1')
        pc1.addStream(this.localStream)

        Trace('pc1 createOffer start')
        pc1.createOffer(offerOptions)
            .then(desc => this.OnCreateOfferSuccess(desc), this.OnCreateSessionDescriptionError)
    }

    OnCreateOfferSuccess(desc)
    {
        Trace('Offer from pc1\n' + desc.sdp)
        Trace('pc1 setLocalDescription start')
        pc1.setLocalDescription(desc)
            .then(evt => onSetLocalSuccess(pc1), this.OnSetSessionDescriptionError)
        Trace('pc2 setRemoteDescription start')
        pc2.setRemoteDescription(desc)
            .then(evt => onSetRemoteSuccess(pc2), this.OnSetSessionDescriptionError)
        Trace('pc2 createAnswer start')
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        pc2.createAnswer().then(onCreateAnswerSuccess, this.OnCreateSessionDescriptionError)
    }

    OnCreateSessionDescriptionError(error)
    {
        Trace('Failed to create session description: ' + error.toString())
    }

    OnSetSessionDescriptionError(error)
    {
        Trace('Failed to set session description: ' + error.toString())
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
