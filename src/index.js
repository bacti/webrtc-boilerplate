const Init = event =>
{
    try
    {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        handleSuccess(stream)
        event.target.disabled = true
    }
    catch (error)
    {
        handleError(error)
    }
  }

window.main = _ =>
{
    document.querySelector('#showVideo').addEventListener('click', Init)
}
