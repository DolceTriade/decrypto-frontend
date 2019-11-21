import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Badge from '@material-ui/core/Badge';
import { withSnackbar } from 'notistack';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/styles';
import { Box, CircularProgress } from '@material-ui/core';

const styles = theme => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    height: 'available',
    width: 'available',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  padding: {
    padding: theme.spacing(0, 2),
    fontSize: 12,
  },
  teamName: {
    paddingBottom: theme.spacing(1),
  },
  words: {
    padding: '0.25em',
  },
  clueField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  card: {
    padding: theme.spacing(1),
  }
});

function TeamJoinButtons(props) {
  return (
    <Grid container spacing={2} justify="center">
      <Grid item>
        <Button variant="contained" color="primary" onClick={props.team_a}>
          Team A
          </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" onClick={props.team_b}>
          Team B
        </Button>
      </Grid>
    </Grid>
  );
}

function TeamLeaveButton(props) {
  return (
    <Grid container spacing={2} justify="center">
      <Grid item>
        <Button variant="contained" color="primary" onClick={props.onClick}>
          Leave Team
          </Button>
      </Grid>
    </Grid>
  );
}

function GameStartButton(props) {
  return (
    <Grid container spacing={2} justify="center">
      <Grid item>
        <Button variant="contained" color="primary" onClick={props.onClick}>
          Start
          </Button>
      </Grid>
    </Grid>
  );
}

function Order(props) {
  let classes = makeStyles(styles);
  let nums = [];
  props.order.forEach(num => {
    nums.push(
      <Grid item key={num}><Paper p={3}><Typography variant="h3" align="center">{num}</Typography></Paper></Grid>
    );
  });
  return (
    <Grid container spacing={1} justify="center">
    {nums}
    </Grid>
  );
}

function Round(props) {
  let classes = makeStyles(styles);
  let order = null;
  let clues = [];
  let actions = [];
  if (props.round['clue_giver'] == props.me) {
    for (var i = 0; i < 3; ++i) {
      clues.push(
        <Grid item key={i}>
          <TextField id={i.toString()}
                     number={i}
                     label={'Clue #' + (i + 1)} 
                     className={classes.clueField} 
                     margin='normal' 
                     onChange={props.setClues} />
        </Grid>);
    }
    if ('order' in props.round) {
      order = <Order order={props.round['order']} />;
    }
    actions.push(<Button key="submit" variant="contained" color="primary" onClick={props.submitClues}>Submit Clues</Button>)
    
  } else if (!('clues' in props.round)) {
    clues = <Grid container justify="center"><CircularProgress justify="center" disableShrink /></Grid>;
  }
  return (
    <Card>
      <CardHeader title={"Round " + (props.round.number + 1)} />
      <CardContent>
        <Grid className={classes.card} spacing={2} container>
          {order}
          {clues}
        </Grid>
      </CardContent>
      <CardActions>{actions}</CardActions>
    </Card>
  )
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      team_a: new Set(),
      team_b: new Set(),
      players: new Set(),
      me: '',
      host: '',
      state: 'setup',
      s: null,
      message: 'Select a team to join!',
      words: [],
      rounds: [],
      drawer: false,
      clues: [],
    };
  }

  onMessage(msg) {
    console.log('Got server response:');
    console.log(msg.data);
    if (!msg.data) return;
    let d = null;
    try {
      d = JSON.parse(msg.data);
    } catch (e) {
      console.log(e);
      return;
    }
    if (!('command' in d)) {
      console.log('No command in response from server. ' + msg);
      return;
    }

    switch (d['command']) {
      case 'error': {
        console.log('ERROR: ' + d['msg']);
        this.error(d['msg']);
      } break;
      case 'player_connected': {
        let new_players = new Set(this.state.players);
        new_players.add(d['player']);
        this.setState({ players: new_players });
        if (this.state.players.size == 1) {
          this.setState({ me: d['player'] });
        }
      } break;
      case 'player_disconnected': {
        let new_players = new Set(this.state.players);
        new_players.delete(d['player']);
        this.setState({ players: new_players });
        // on_player_disconnected(d['player']);
      } break;
      case 'joined_team': {
        console.log(d);
        if (this.state.me === d['name']) {
          this.setState({ message: 'Waiting for game to start...' });
        }
        if (d['team'] === 'a') {
          let team = new Set(this.state.team_a);
          team.add(d['name']);
          this.setState({ team_a: team });
        } else if (d['team'] === 'b') {
          let team = new Set(this.state.team_b);
          team.add(d['name']);
          this.setState({ team_b: team });
        } else {
          console.log('ERROR: joined_team: invalid team: ' + d['team']);
          return;
        }
      } break;
      case 'left_team': {
        if (d['team'] === 'a') {
          let team = new Set(this.state.team_a);
          team.delete(d['name']);
          this.setState({ team_a: team });
        } else if (d['team'] === 'b') {
          let team = new Set(this.state.team_b);
          team.delete(d['name']);
          this.setState({ team_b: team });

        } else {
          console.log('ERROR: left_team: invalid team: ' + d['team']);
          return;
        }
      } break;
      case 'new_host': {
        this.setState({ host: d['player'] });
      } break;
      case 'words': {
        this.setState({ state: 'words' });
        this.setState({ words: d['words'].slice(0) });
      } break;
      case 'round': {
        let rounds = this.state.rounds.slice(0);
        rounds.push(d);
        this.setState({ rounds: rounds, message: 'Waiting for clues...' });
      } break;
      case 'order': {
        let rounds = this.state.rounds.slice(0);
        rounds[d['number']]['order'] = d['order'];
        this.setState({ rounds: rounds, message: 'Please give clues that match the order' });
      } break;
      default: {
        console.log('Unhandled: ' + d);
      } break;
    }
  }

  createSocket(props) {
    console.log("CREATING SOCKET");
    let s = new WebSocket('ws://' + document.domain + ':8080' + window.location.pathname + '/ws')

    s.onerror = function (e) {
      console.log("ERROR:");
      console.log(e);
    }

    s.onmessage = msg => this.onMessage(msg);
    return s;
  }

  componentDidMount() {
    console.log("GAME MOUNT");
    console.log(this.state);
    if (this.state.s === null) {
      this.setState({ s: this.createSocket(this.props) });
    }
  }

  componentWillUnmount() {
    if (this.state.s === null) {
      this.state.s.close();
      this.setState({ s: null });
    }
  }

  error(msg) {
    this.props.enqueueSnackbar(msg, {
      variant: 'error',
    });
  }

  join_a() {
    this.state.s.send(JSON.stringify({ 'command': 'join_a' }));
  }

  join_b() {
    this.state.s.send(JSON.stringify({ 'command': 'join_b' }));
  }

  leave_team() {
    this.state.s.send(JSON.stringify({ 'command': 'leave_team' }));
  }

  start_game() {
    this.state.s.send(JSON.stringify({ 'command': 'start_game' }));
  }

  set_clues(e) {
    let clues = this.state.clues;
    clues[parseInt(e.target.id)] = e.target.value;
    this.setState({ clues: clues });
  }

  submit_clues() {
    let clues = this.state.clues;
    console.log(clues);
    if (clues.length != 3) {
      this.error('Only ' + clues.length + ' set!');
      return;
    }
    if (!clues.reduce((c, v) => c && v, true)) {
      this.error('Some clues empty!');
      return;
    }
    this.state.s.send(JSON.stringify({ 
      'command': 'clues', 
      'clues': clues, 
      'number': this.state.rounds.length - 1 }));
  }

  getClueGiver() {
    if (this.state.state !== 'words') return null;
    if (this.state.rounds.length == 0) return null;
    return this.state.rounds[this.state.rounds.length - 1]['clue_giver'];
  }

  getEnemyClueGiver() {
    if (this.state.state !== 'words') return null;
    if (this.state.rounds.length == 0) return null;
    return this.state.rounds[this.state.rounds.length - 1]['enemy_clue_giver'];
  }

  toggleDrawer() {
    this.setState({ drawer: !this.state.drawer });
  }

  render() {
    console.log('RENDER GAME');
    console.log(this.state);
    const classes = this.props.classes;
    let team_a_jsx = [];
    let team_b_jsx = [];
    let host = this.state.host;
    let players = this.state.players;
    let me = this.state.me;
    let clue_giver = this.getClueGiver();
    let enemy_clue_giver = this.getEnemyClueGiver();
    this.state.team_a.forEach(function (player) {
      let show_badge = player == clue_giver || player == enemy_clue_giver ? "CG" : 0;
      let color = me === player ? "textPrimary" : "textSecondary";
      team_a_jsx.push(<Grid xs item key={player}><Badge badgeContent={show_badge} color="secondary" className={classes.padding}><Typography component="h5" align="center" color={color} key={player}>{player}</Typography></Badge></Grid>);
    });
    this.state.team_b.forEach(function (player) {
      let show_badge = player == clue_giver || player == enemy_clue_giver ? "CG" : 0;
      let color = me === player ? "textPrimary" : "textSecondary";
      team_b_jsx.push(<Grid xs item key={player}><Badge badgeContent={show_badge} color="secondary" className={classes.padding}><Typography component="h5" align="center" color={color} key={player}>{player}</Typography></Badge></Grid>);
    });

    let buttons = [];
    let words = [];
    if (this.state.state === 'setup') {
      if ((this.state.team_a.has(this.state.me) || this.state.team_b.has(this.state.me))) {
        buttons.push(<TeamLeaveButton key="leave" onClick={this.leave_team.bind(this)} />);
        if (this.state.me === host) {
          buttons.push(<GameStartButton key="start" onClick={this.start_game.bind(this)} />);
        }
      } else {
        buttons = <TeamJoinButtons key="join" team_a={this.join_a.bind(this)} team_b={this.join_b.bind(this)} />;
      }
    } else if (this.state.words.length > 0) {
      this.state.words.forEach(function (word, idx) {
        words.push(
          <Grid item key={word}>
            <Badge badgeContent={idx + 1} color="secondary" lassName={classes.padding}>
            <Paper className={classes.card}>
              <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom>
                {word}
              </Typography>
            </Paper>
            </Badge>
          </Grid>);
      });
    }

    let order = this.state.order;
    let rounds = [];
    let self = this;
    this.state.rounds.forEach(function (round) {
      rounds.push(<Round key={round['number']} round={round} me={me} setClues={self.set_clues.bind(self)} submitClues={self.submit_clues.bind(self)} />);
    });

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="relative">
          <Toolbar>
            <MenuIcon className={classes.icon} onClick={this.toggleDrawer.bind(this)} />
            <Typography variant="h6" color="inherit" noWrap>
              Decrypto
          </Typography>
          </Toolbar>
        </AppBar>
        <Drawer open={this.state.drawer} onClose={this.toggleDrawer.bind(this)}>
          <Container>
            <Paper>
              <Typography component="h3" variant="h5" align="center" color="textPrimary" className={classes.teamName}>Team A</Typography>
              {team_a_jsx}
            </Paper>
            <Paper>
              <Typography component="h3" variant="h5" align="center" color="textPrimary" className={classes.teamName}>Team B</Typography>
              {team_b_jsx}
            </Paper>
          </Container>
        </Drawer>
        <Container className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
              {this.state.message}
            </Typography>
          </Container>
          <Container className={classes.heroButtons}>
            {buttons}
          </Container>
          <Container className={classes.icon}>
            <Grid container spacing={2} justify="center">
              {words}
            </Grid>
          </Container>
        </Container>
        <Container>
          {rounds}
        </Container>
      </React.Fragment>
    );
  }
}

export default withSnackbar(withStyles(styles)(Game));
