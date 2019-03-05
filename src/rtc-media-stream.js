import { Trace } from './log'
export default RTCMediaStream
{
    constructor(servers)
    {
        this.pc = new RTCPeerConnection(servers)
        this.pc.onicecandidate = evt => this.OnIceCandidate(this.pc, evt)
        this.pc.oniceconnectionstatechange = evt => this.OnIceStateChange(this.pc, evt)
    }

    OnIceCandidate(pc, evt)
    {
        GetOtherPc(pc).addIceCandidate(evt.candidate)
            .then(evt => this.OnAddIceCandidateSuccess(pc), err => this.OnAddIceCandidateError(pc, err))
        Trace(getName(pc) + ' ICE candidate: \n' + (evt.candidate ? evt.candidate.candidate : '(null)'))
    }

    OnAddIceCandidateSuccess(pc)
    {
        Trace(getName(pc) + ' addIceCandidate success')
    }
      
    OnAddIceCandidateError(pc, error)
    {
        Trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString())
    }

    OnIceStateChange(pc, evt)
    {
        if (pc)
        {
            Trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState)
            console.log('ICE state change event: ', evt)
        }
    }
}
