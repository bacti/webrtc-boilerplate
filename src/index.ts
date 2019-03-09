import { h, Component } from 'preact'

// interface HelloProps { compiler: string; framework: string; }

// // 'HelloProps' describes the shape of props.
// // State is never set so we use the '{}' type.
// class Hello extends Component<HelloProps, {}>
// {
//     render()
//     {
//         return <h1>{`Hello from {this.props.compiler} and {this.props.framework}!`}</h1>;
//     }
// }


export interface AppProps {
    name: string;
  }
  
  interface AppState {
    name: string;
  }
  
  export class App extends Component<any
  , AppState> {
    constructor(props: AppProps) {
      super(props);
  
      this.state = { name: props.name };
    }
    componentDidMount() {
      setTimeout(() => { 
        var state = this.state;
        
        this.setState({ name: "Preact's componentDidMount worked as expected" });
      }, 2000);
    }
    render(props: AppProps, state: AppState) {
      return <h1>props: {props.name} state: {state.name}</h1>;
    }
  }
  
(<any>window).main = () =>
{
    // render(<App />, document.body)
}
