import React from 'react';
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Lobby from './components/lobby';
import Game from './components/game';
import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
        <main>
          <Router>
            <Route exact path="/" component={Lobby} />
            <Route path="/game" component={Game} />
          </Router>
        </main>
    </SnackbarProvider>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
