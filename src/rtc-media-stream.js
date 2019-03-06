import { Trace } from './log'
export default class RTCMediaStream extends RTCPeerConnection
{
    constructor(name, servers)
    {
        super(servers)
        this.name = name
        this.onicecandidate = evt => this.OnIceCandidate(evt)
        this.oniceconnectionstatechange = evt => this.OnIceStateChange(evt)
    }

    SetPeer(otherpc)
    {
        this.otherpc = otherpc
    }

    OnIceCandidate(evt)
    {
        this.otherpc.addIceCandidate(evt.candidate)
            .then(evt => Trace(this.name + ' addIceCandidate success'), err => Trace(this.name + ' failed to add ICE Candidate: ' + err.toString()))
        Trace(this.name + ' ICE candidate: \n' + (evt.candidate ? evt.candidate.candidate : '(null)'))
    }

    OnIceStateChange(evt)
    {
        Trace(this.name + ' ICE state: ' + this.iceConnectionState)
        console.log('ICE state change event: ', evt)
    }
}
