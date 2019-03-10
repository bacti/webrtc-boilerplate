import { h, render, Component } from 'preact'

class Hello extends Component<{ compiler: string; framework: string }, {}>
{
    render()
    {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}

declare global
{
    interface Window { main: any }
}

window.main = () =>
{
    render(<Hello compiler="TypeScript" framework="React" />, document.body)
}
