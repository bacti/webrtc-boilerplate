import { Trace } from './log'
export default class RTCMediaStream extends RTCPeerConnection
{
    constructor(name, servers)
    {
        super(servers)
        this.name = name
    }

    SetPeer(otherpc)
    {
        this.otherpc = otherpc
    }

    onicecandidate(evt)
    {
        this.otherpc.addIceCandidate(evt.candidate)
            .then(evt => Trace(this.name + ' addIceCandidate success'), err => Trace(this.name + ' failed to add ICE Candidate: ' + err.toString()))
        Trace(this.name + ' ICE candidate: \n' + (evt.candidate ? evt.candidate.candidate : '(null)'))
    }

    oniceconnectionstatechange(evt)
    {
        Trace(this.name + ' ICE state: ' + this.iceConnectionState)
        console.log('ICE state change event: ', evt)
    }
}
