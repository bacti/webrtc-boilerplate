const Constraints = 
{
    audio: false,
    video: true,
}

function HandleSuccess(stream)
{
    console.log(stream)
    const video = document.querySelector('video');
    const videoTracks = stream.getVideoTracks();
    console.log('Got stream with constraints:', constraints);
    console.log(`Using video device: ${videoTracks[0].label}`);
    window.stream = stream; // make variable available to browser console
    video.srcObject = stream;
}
  
function HandleError(error)
{
    if (error.name === 'ConstraintNotSatisfiedError') {
      let v = constraints.video;
      errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
    } else if (error.name === 'PermissionDeniedError') {
      errorMsg('Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.');
    }
    errorMsg(`getUserMedia error: ${error.name}`, error);
}

const Init = event =>
{
    try
    {
        const { mediaDevices } = window.navigator
        mediaDevices.getUserMedia(Constraints).then(HandleSuccess)
        event.target.disabled = true
    }
    catch (error)
    {
        console.log(error)
        // HandleError(error)
    }
  }

window.main = _ =>
{
    document.querySelector('#showVideo').addEventListener('click', Init)
}
