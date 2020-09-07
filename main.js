import { createElement, render, Component } from './toy-react'

class TestComponent extends Component {
  render() {
    return (
      <div>
        <h1>title</h1>
        {this.children}
      </div>
    )
  }
}


render(
  <TestComponent id="b" class="c">
    <div>tony</div><div>xu</div>
  </TestComponent>
  , document.body);

