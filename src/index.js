import  PeerConnection from 'rtcpeerconnection'
require('./index.css')

const constraints = { audio: false, video: true }

function HandleSuccess(stream)
{
    const videoTracks = stream.getVideoTracks()
    const video = document.querySelector('video')
    video.srcObject = stream
    // console.log(stream.getVideoTracks()[0].getSettings())
    console.log('Got stream with constraints:', constraints)
    console.log(`Using video device: ${videoTracks[0].label}`)
}
  
function HandleError(error)
{
    if (error.name === 'ConstraintNotSatisfiedError')
    {
        let v = constraints.video
        console.log(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`)
    }
    else
    if (error.name === 'PermissionDeniedError')
    {
        console.log('Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.')
    }
    console.log(`getUserMedia error: ${error.name}`, error)
}

const Init = event =>
{
    try
    {
        const { mediaDevices } = window.navigator
        mediaDevices.getUserMedia(constraints).then(HandleSuccess)
        // event.target.disabled = true
    }
    catch (error)
    {
        HandleError(error)
    }
}

const Broadcast = event =>
{
}

window.main = _ =>
{
    Init()
    // document.querySelector('#showVideo').addEventListener('click', Init)

    // assumptions
    var pc = new PeerConnection({ sdpSemantics: 'Default' }, constraints);
    var connection = new RealTimeConnection(); // could be socket.io or whatever


    // create an offer
    pc.offer(function (err, offer) {
        if (!err) connection.send('offer', offer)
    });

    // you can also optionally pass in constraints
    // when creating an offer.
    pc.offer(
        {
            offerToReceiveAudio: true,
            offerToReceiveVideo: false
        }, 
        function (err, offer) {
            if (!err) connection.send('offer', offer);
        }
    );

    // when you recieve an offer, you can answer
    // with various options
    connection.on('offer', function (offer) {
        // let the peerconnection handle the offer
        // by calling handleOffer
        pc.handleOffer(offer, function (err) {
            if (err) {
                // handle error
                return;
            }

            // you can just call answer
            pc.answer(function (err, answer) {
                if (!err) connection.send('answer', answer);
            });

            // you can call answer with contstraints
            pc.answer(MY_CONSTRAINTS, function (err, answer) {
                if (!err) connection.send('answer', answer);
            });    

            // or you can use one of the shortcuts answers

            // // for video only
            // pc.answerVideoOnly(function (err, answer) { ... });

            // // and audio only
            // pc.answerAudioOnly(function (err, answer) { ... });
        }); 
    });

    // when you get an answer, you just call
    // handleAnswer
    connection.on('answer', function (answer) {
        pc.handleAnswer(answer);
    });

    // the only other thing you have to do is listen, transmit, and process ice candidates

    // you have to send them when generated
    pc.on('ice', function (candidate) {
        connection.send('ice', candidate);
    });

    // process incoming ones
    connection.on('ice', function (candidate) {
        pc.processIce(candidate);
    });
}
