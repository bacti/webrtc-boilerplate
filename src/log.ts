export const Trace = (message: String) =>
{
    const now = (window.performance.now() / 1000).toFixed(3)
    console.warn(now + ': ', message)
}
  