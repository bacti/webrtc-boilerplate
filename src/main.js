import { Trace } from './log'

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

var startTime;
var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata', function() {
  Trace('Local video videoWidth: ' + this.videoWidth +
    'px,  videoHeight: ' + this.videoHeight + 'px');
});

remoteVideo.addEventListener('loadedmetadata', function() {
  Trace('Remote video videoWidth: ' + this.videoWidth +
    'px,  videoHeight: ' + this.videoHeight + 'px');
});

remoteVideo.onresize = function() {
  Trace('Remote video size changed to ' +
    remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
  // We'll use the first onsize callback as an indication that video has started
  // playing out.
  if (startTime) {
    var elapsedTime = window.performance.now() - startTime;
    Trace('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
    startTime = null;
  }
};

var localStream;
var pc1;
var pc2;
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function gotStream(stream) {
  Trace('Received local stream');
  localVideo.srcObject = stream;
  localStream = stream;
  callButton.disabled = false;
}

function start() {
  Trace('Requesting local stream');
  startButton.disabled = true;
  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(gotStream)
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });
}

function call()
{
  callButton.disabled = true;
  hangupButton.disabled = false;
  Trace('Starting call');
  startTime = window.performance.now();
  var videoTracks = localStream.getVideoTracks();
  var audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    Trace('Using video device: ' + videoTracks[0].label);
  }
  if (audioTracks.length > 0) {
    Trace('Using audio device: ' + audioTracks[0].label);
  }
  var servers = null;
  pc1 = new RTCPeerConnection(servers);
  Trace('Created local peer connection object pc1');
  pc1.onicecandidate = e => onIceCandidate(pc1, e);

  pc2 = new RTCPeerConnection(servers);
  Trace('Created remote peer connection object pc2');
  pc2.onicecandidate = e => onIceCandidate(pc2, e);

  pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e);
  pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);

  pc2.onaddstream = gotRemoteStream;

  pc1.addStream(localStream);
  Trace('Added local stream to pc1');

  Trace('pc1 createOffer start');
  pc1.createOffer(offerOptions).then(onCreateOfferSuccess, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
  Trace('Failed to create session description: ' + error.toString());
}

function onCreateOfferSuccess(desc)
{
  Trace('Offer from pc1\n' + desc.sdp);
  Trace('pc1 setLocalDescription start');
  pc1.setLocalDescription(desc)
    .then(evt => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
  Trace('pc2 setRemoteDescription start');
  pc2.setRemoteDescription(desc)
    .then(evt => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
  Trace('pc2 createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pc2.createAnswer().then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
  Trace(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
  Trace(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
  Trace('Failed to set session description: ' + error.toString());
}

function gotRemoteStream(e) {
  remoteVideo.srcObject = e.stream;
  Trace('pc2 received remote stream');
}

function onCreateAnswerSuccess(desc) {
  Trace('Answer from pc2:\n' + desc.sdp);
  Trace('pc2 setLocalDescription start');
  pc2.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(pc2);
    },
    onSetSessionDescriptionError
  );
  Trace('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(pc1);
    },
    onSetSessionDescriptionError
  );
}

function onIceCandidate(pc, event)
{
  getOtherPc(pc)
    .addIceCandidate(event.candidate)
    .then(_ => onAddIceCandidateSuccess(pc), err => onAddIceCandidateError(pc, err))
  Trace(getName(pc) + ' ICE candidate: \n' + (event.candidate ?
    event.candidate.candidate : '(null)'));
}

function onAddIceCandidateSuccess(pc) {
  Trace(getName(pc) + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
  Trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
}

function onIceStateChange(pc, event) {
  if (pc) {
    Trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
    console.log('ICE state change event: ', event);
  }
}

function hangup() {
  Trace('Ending call');
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
}
