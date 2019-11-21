import React from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import { withRouter } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import { withSnackbar } from 'notistack';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';

const styles = theme => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1)
  },
  heroButtons: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  }
})

class Lobby extends React.Component {
  constructor(props) {
    super(props)
    this.state = { s: null }
  }
  createSocket(props) {
    console.log('CREATING SOCKET')
    let s = new WebSocket('ws://' + document.domain + ':8080' + '/lobby_ws')
    s.onmessage = function (msg) {
      console.log('Got server response:')
      console.log(msg)
      let d = null
      try {
        d = JSON.parse(msg.data)
      } catch (e) {
        console.log(e)
        return
      }
      if (!('command' in d)) {
        console.log('No command in response from server. ' + msg)
        return
      }

      switch (d['command']) {
        case 'join_game':
          {
            let url = new URL(d['game'])
            props.history.push({ pathname: url.pathname })
          }
          break
        case 'error':
          {
            console.log('ERROR: ' + d['msg'])
            this.props.enqueueSnackbar(d['msg'], {
              variant: 'error',
            });
          }
          break
        default:
          {
            console.log('Unhandled command: ' + d)
          }
          break
      }
    }
    return s
  }
  join_or_create() {
    let name = document.getElementById('name').value
    let room = document.getElementById('room').value
    if (!name) {
      // TODO: replace with toast
      console.log('ERROR: Name cannot be empty.')
      return
    }
    if (!room) {
      // TODO: replace with toast
      console.log('ERROR: Room cannot be empty.')
      return
    }
    this.state.s.send(
      JSON.stringify({ command: 'join_or_create_game', name: name, room: room })
    )
  }
  componentDidMount() {
    console.log("LOBBY MOUNT");
    console.log(this.state);
    if (this.state.s === null) {
      this.setState({ s: this.createSocket(this.props) })
    }
  }
  componentWillUnmount() {
    console.log("LOBBY UNMOUNT");
    if (this.state.s === null) {
      this.state.s.close()
      this.setState({ s: null })
    }
  }
  render() {
    const classes = this.props.classes

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="relative">
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              Decrypto
          </Typography>
          </Toolbar>
        </AppBar>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth='sm'>
            <Typography
              component='h1'
              variant='h2'
              align='center'
              color='textPrimary'
              gutterBottom
            >
              Decrypto
            </Typography>
            <Typography
              variant='h5'
              align='center'
              color='textSecondary'
              paragraph
            >
              Enter a game name and user name to join or create a game!
            </Typography>
          </Container>
          <Container>
            <Paper align='center'>
              <TextField
                id='name'
                label='Name'
                className={classes.textField}
                margin='normal'
              />
              <TextField
                id='room'
                label='Room'
                className={classes.textField}
                margin='normal'
              />
              <br />
              <Button
                variant='contained'
                color='primary'
                className={classes.heroButtons}
                onClick={this.join_or_create.bind(this)}
              >
                Join or Create Game
              </Button>
            </Paper>
          </Container>
        </div>
      </React.Fragment>
    )
  }
}

export default withSnackbar(withRouter(withStyles(styles)(Lobby)));
