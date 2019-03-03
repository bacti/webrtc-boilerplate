require('./index.css')

const Constraints = 
{
    audio: false,
    video: true,
}

function HandleSuccess(stream)
{
    const videoTracks = stream.getVideoTracks()
    const video = document.querySelector('video')
    video.srcObject = stream
    // console.log(stream.getVideoTracks()[0].getSettings())
    console.log('Got stream with constraints:', Constraints)
    console.log(`Using video device: ${videoTracks[0].label}`)
}
  
function HandleError(error)
{
    if (error.name === 'ConstraintNotSatisfiedError')
    {
        let v = Constraints.video
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
        mediaDevices.getUserMedia(Constraints).then(HandleSuccess)
        // event.target.disabled = true
    }
    catch (error)
    {
        HandleError(error)
    }
  }

window.main = _ => Init()
// {
//     document.querySelector('#showVideo').addEventListener('click', Init)
// }
