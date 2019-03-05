import { Trace } from './log'

export default RTCMediaStream
{
    constructor(servers)
    {
        this.pc = new RTCPeerConnection(servers)
        this.pc.onicecandidate = evt => this.OnIceCandidate(this.pc, evt)
    }

    OnIceCandidate(pc, evt)
    {
        GetOtherPc(pc)
            .addIceCandidate(evt.candidate)
            .then(evt => OnAddIceCandidateSuccess(pc), err => OnAddIceCandidateError(pc, err))
        Trace(getName(pc) + ' ICE candidate: \n' + (evt.candidate ? evt.candidate.candidate : '(null)'))
    }
}
