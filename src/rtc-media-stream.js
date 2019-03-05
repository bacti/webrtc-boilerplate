import { Trace } from './log'
export default class RTCMediaStream
{
    constructor(name, servers)
    {
        this.name = name
        this.pc = new RTCPeerConnection(servers)
        this.pc.onicecandidate = evt => this.OnIceCandidate(evt)
        this.pc.oniceconnectionstatechange = evt => this.OnIceStateChange(evt)
    }

    SetPeer(otherpc)
    {
        this.otherpc = otherpc
    }

    OnIceCandidate(evt)
    {
        this.otherpc.addIceCandidate(evt.candidate)
            .then(evt => this.OnAddIceCandidateSuccess(), err => this.OnAddIceCandidateError(err))
        Trace(this.name + ' ICE candidate: \n' + (evt.candidate ? evt.candidate.candidate : '(null)'))
    }

    OnAddIceCandidateSuccess()
    {
        Trace(this.name + ' addIceCandidate success')
    }
      
    OnAddIceCandidateError(error)
    {
        Trace(this.name + ' failed to add ICE Candidate: ' + error.toString())
    }

    OnIceStateChange(evt)
    {
        Trace(this.name + ' ICE state: ' + this.pc.iceConnectionState)
        console.log('ICE state change event: ', evt)
    }
}
