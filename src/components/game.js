import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
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
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CancelIcon from '@material-ui/icons/Cancel';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
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
    marginBottom: theme.spacing(1),
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
  },
  bottomBar: {
    position: 'static',
    overflow: 'none',
    height: theme.spacing(15),
    backgroundColor: theme.palette.background.paper,
  },
  chatBox: {
    width: '100%',
    overflow: 'auto',
    height: theme.spacing(15),
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    zIndex: 2,
    elevation: 0,
  },
});

let randomKey = _ => Math.random().toString(36);

let makeSystemMessage = msg => { return { system: true, name: '', message: msg }; }

function TeamJoinButtons(props) {
  return (
    <Grid container spacing={2} justifyContent="center">
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
    <Grid container spacing={2} justifyContent="center">
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
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <Button variant="contained" color="primary" onClick={props.onClick}>
          Start
          </Button>
      </Grid>
    </Grid>
  );
}

function Order(props) {
  let nums = [];
  props.order.forEach(num => {
    nums.push(
      <Grid item key={num}><Paper p={3}><Typography variant="h5" align="center">{num}</Typography></Paper></Grid>
    );
  });
  return (
    <Grid container spacing={1} justifyContent="center">
      {nums}
    </Grid>
  );
}

function Round(props) {
  let classes = makeStyles(styles);
  let order = null;
  let clues = [];
  let actions = [];
  if (props.round['clue_giver'] === props.me && !('guesses' in props.round)) {
    if ('clues' in props.round) {
      clues = <Grid container justifyContent="center"><CircularProgress disableShrink /></Grid>;
    } else {
      for (var i = 0; i < 3; ++i) {
        let key = 'clues' + i;
        clues.push(
          <Grid item key={key}>
            <TextField id={key}
              name={i.toString()}
              autoComplete='off'
              label={'Clue #' + (i + 1)}
              className={classes.clueField}
              margin='normal'
              onChange={props.setClues} />
          </Grid>);
      }
    }
    if ('order' in props.round) {
      order = <Order order={props.round['order']} />;
    }
    if (!('clues' in props.round)) {
      actions.push(<Button key="submitc" variant="contained" color="primary" onClick={props.submitClues}>Submit Clues</Button>);
    }
  } else if ('clues' in props.round && !('guesses' in props.round)) {
    for (i = 0; i < 3; ++i) {
      let key = 'guesses' + i;
      clues.push(
        <Grid item key={key}>
          <TextField id={key}
            name={i.toString()}
            autoComplete='off'
            type='number'
            label={props.round['clues'][i]}
            className={classes.clueField}
            margin='normal'
            onChange={props.setGuesses} />
        </Grid>);
    }
    actions.push(<Button key="submitg" variant="contained" color="primary" onClick={props.submitGuesses}>Submit Guesses</Button>);
  } else if ('spy_clues' in props.round && !('team_spy_guesses' in props.round) && 'clues' in props.round) {
    for (i = 0; i < 3; ++i) {
      let key = 'spyguesses' + i;
      clues.push(
        <Grid item key={key}>
          <TextField id={key}
            name={i.toString()}
            autoComplete='off'
            type='number'
            label={props.round['spy_clues'][i]}
            className={classes.clueField}
            margin='normal'
            onChange={props.setSpyGuesses} />
        </Grid>);
    }
    actions.push(<Button key="submitsg" variant="contained" color="primary" onClick={props.submitSpyGuesses}>Submit Spy Guesses</Button>);
  } else if ('spy_order' in props.round && 'order' in props.round) {
    order = (
      <Container>
        <Typography>Your order:</Typography>
        <Order order={props.round['order']} />

        <Typography>Your Guess:</Typography>
        <Order order={props.round['guesses']} />

        <Typography>Spies Order:</Typography>
        <Order order={props.round['spy_order']} />

        <Typography>Your Spy Guess:</Typography>
        <Order order={props.round['team_spy_guesses']} />
      </Container>
    );
    clues.push(<Grid item key={randomKey()}><Typography>Your Clues:</Typography></Grid>);
    props.round.clues.forEach(function (clue, idx) {
      clues.push(<Grid item key={randomKey()}><Typography>{idx + 1}. {clue}</Typography></Grid>);
    });
    clues.push(<Grid item key={randomKey()}><Typography>Spy Clues:</Typography></Grid>);
    props.round.spy_clues.forEach(function (clue, idx) {
      clues.push(<Grid item key={randomKey()}><Typography>{idx + 1}. {clue}</Typography></Grid>)
    });
    clues = <Grid container direction="column" justifyContent="center">{clues}</Grid>
  } else {
    clues = <Grid container justifyContent="center"><CircularProgress disableShrink /></Grid>;
  }
  return (
    <ExpansionPanel expanded={props.expanded === props.round.number} onChange={props.handleExpansion(props.round.number)}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography color="textPrimary" variant="h6">Round {props.round.number + 1}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid className={classes.card} spacing={2} container>
          {order}
          {clues}
        </Grid>
      {actions}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

function Chat(props) {
  let msgs = [];
  let formatTime = date => date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0'); 
  props.chat.forEach(function (msg, idx) {
    if ('system' in msg) {
      msgs.push(
        <Container key={msg.date + msg.date.getMilliseconds() + msg.name + msg.chat}>
          <Typography display='inline'>[{formatTime(msg.date)}]</Typography>
          <Typography display='inline' color="textSecondary" fontStyle="italic">: {msg.message}</Typography>
        </Container>);
    } else {
      msgs.push(
        <Container key={msg.date + msg.date.getMilliseconds() + msg.name + msg.chat}>
          <Typography display='inline'>[{formatTime(msg.date)}]</Typography>
          <Typography display='inline'> <b>{msg.name}</b></Typography>
          <Typography display='inline'>: {msg.message}</Typography>
        </Container>);
    }
  });
  let onEnterPressed = event => {
    event.preventDefault();
    if (event.key === 'Enter') {
      props.sendchat(event.target.value);
      event.target.value = null;
    }
  }

  return (
    <React.Fragment>
      <Container id={props.id} className={props.className}>
        {msgs}
      </Container>
      <TextField name='chat' fullWidth onKeyUp={onEnterPressed} autoComplete='off' label='Press enter to send chat...' margin='normal' />
    </React.Fragment>
  );
}

function ClueView(props) {
  let contents = [];
  for (var i = 0; i < props.clues.length; ++i) {
    if (!Array.isArray(props.clues[i])) {
      continue;
    }
    let inner = [];
    for (var j = 1; j < props.clues[i].length; ++j) {
      inner.push(
        <TableCell key={j}>{props.clues[i][j] ? props.clues[i][j] : ''}</TableCell>
      );
    }
    contents.push(
      <TableRow key={i}>
        {inner}
      </TableRow>
    )
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Word 1</TableCell>
          <TableCell>Word 2</TableCell>
          <TableCell>Word 3</TableCell>
          <TableCell>Word 4</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {contents}
      </TableBody>
    </Table>
  );
}

function TabPanel(props) {
  if (props.value !== props.index) return null;
  return <Container>{props.children}</Container>;
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
      connected: false,
      message: 'Select a team to join!',
      words: [],
      rounds: [],
      drawer: false,
      clues: [],
      guesses: [],
      spy_guesses: [],
      score: null,
      expanded: false,
      tab: 0,
      all_chat: [],
      team_chat: [],
      clue_view: [],
      spy_clue_view: [],
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
      case 'error':
        console.log('ERROR: ' + d['msg']);
        this.error(d['msg']);
      break;
      case 'player_connected': {
        let new_players = new Set(this.state.players);
        new_players.add(d['player']);
        this.setState({ players: new_players });
        if (this.state.players.size === 1) {
          this.setState({ me: d['player'] });
        }
        this.push_chat('all_chat', makeSystemMessage(d['player'] + ' connected.'));
      } break;
      case 'player_disconnected': {
        let new_players = new Set(this.state.players);
        new_players.delete(d['player']);
        this.setState({ players: new_players });
        this.push_chat('all_chat', makeSystemMessage(d['player'] + ' disconnected.'));
      } break;
      case 'joined_team':
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
        this.push_chat('all_chat', makeSystemMessage(d['name'] + ' joined team ' + d['team'].toUpperCase()));
      break;
      case 'left_team':
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
        this.push_chat('all_chat', makeSystemMessage(d['name'] + ' left team ' + d['team'].toUpperCase()));
      break;
      case 'new_host':
        this.setState({ host: d['player'] });
        this.push_chat('all_chat', makeSystemMessage(d['player'] + ' is the new host'));
      break;
      case 'words':
        this.setState({ state: 'words' });
        this.setState({ words: d['words'].slice(0) });
      break;
      case 'round': {
        let rounds = this.state.rounds.slice(0);
        rounds[d['number']] = { ...rounds[d['number']], ...d };
        if ('clues' in rounds[d['number']] && 'guesses' in rounds[d['number']]) {
          this.setState({ rounds: rounds,
            message: 'Guess the enemies order...',
            spy_guesses: [],
            expanded: d.number });
        } else if ('clues' in rounds[d['number']]) {
          this.setState({ rounds: rounds,
            message: 'Match the clues with the word...',
            guesses: [],
            expanded: d.number });
        } else {
          this.setState({ rounds: rounds,
            message: 'Waiting for clues...',
            clues: [],
            expanded: d.number });
        }
        if ('order' in d && 'spy_order' in d) {
          let clue_view = this.state.clue_view;
          let spy_clue_view = this.state.spy_clue_view;
          let array = [];
          let spy_array = [];
          for (var i = 0; i < d.order.length; ++i) {
            array[d.order[i]] = d.clues[i];
            spy_array[d.spy_order[i]] = d.spy_clues[i];
          }
          clue_view[d.number] = array;
          spy_clue_view[d.number] = spy_array;
          this.setState({ clue_view: clue_view, spy_clue_view: spy_clue_view });
        }
      } break;
      case 'order': {
        let rounds = this.state.rounds.slice(0);
        if (!rounds[d['number']]) {
          rounds[d['number']] = {};
        }
        if ('order' in rounds[d['number']]) break;
        rounds[d['number']]['order'] = d['order'];
        this.setState({ rounds: rounds, message: 'Please give clues that match the order' });
      } break;
      case 'score':
        if ('winner' in d) {
          this.setState({ score: d, message: d['winner'] + ' wins the game! The words are: Team A: ' + d.words.team_a + ' Team B:' + d.words.team_b });
        } else if ('tie' in d) {
          this.setState({ score: d, message: 'Game is a tie! The words are: Team A: ' + d.words.team_a + ' Team B:' + d.words.team_b });
        } else {
          this.setState({ score: d });
        }
      break;
      case 'team_chat':
        this.push_chat('team_chat', d);
      break;
      case 'all_chat':
        this.push_chat('all_chat', d);
      break;
      default:
        console.log('Unhandled: ' + d);
      break;
    }
  }

  createSocket(props) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    let url = wsProtocol + window.location.hostname + ':' + window.location.port + window.location.pathname + '/ws';
    if (process.env.NODE_ENV === 'development') {
      url = wsProtocol + window.location.hostname + ':8080' + window.location.pathname + '/ws';
    }
    let s = new WebSocket(url);

    s.onerror = function (e) {
      console.log("ERROR:");
      console.log(e);
    }

    s.onmessage = msg => this.onMessage(msg);

    s.onopen = _ => this.setState({ connected: true });
    s.onclose = _ => this.setState({ connected: false });
    return s;
  }

  componentDidMount() {
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

  send(msg) {
    if (!this.state.s || this.state.s.readyState !== this.state.s.OPEN) {
      this.error('Websocket not connected! Try refreshing.');
      return;
    }
    this.state.s.send(JSON.stringify(msg));
  }

  error(msg) {
    let action = key => (
      <Button onClick={() => { this.props.closeSnackbar(key) }}>
        Dismiss <CancelIcon />
      </Button>
    );
    this.props.enqueueSnackbar(msg, {
      variant: 'error',
      action
    });
  }

  join_a() {
    this.send({ 'command': 'join_a' });
  }

  join_b() {
    this.send({ 'command': 'join_b' });
  }

  leave_team() {
    this.send({ 'command': 'leave_team' });
  }

  start_game() {
    this.send({ 'command': 'start_game' });
  }

  set_field(field, e) {
    let obj = this.state[field];
    let state = {};
    if (e.target.type === 'number') {
      obj[parseInt(e.target.name)] = parseInt(e.target.value);
    } else {
      obj[parseInt(e.target.name)] = e.target.value;
    }
    state[field] = obj;
    this.setState(state);
  }

  submit_field(field, e) {
    let obj = this.state[field];
    if (obj.length !== 3) {
      this.error('Only ' + obj.length + ' set!');
      return;
    }
    if (!obj.reduce((c, v) => c && v, true)) {
      this.error('Some ' + field + ' empty!');
      return;
    }
    this.send({
      'command': field,
      [field]: obj,
      'number': this.state.rounds.length - 1,
    });
  }

  send_chat(command, message) {
    this.send({command: command, message: message});
  }

  push_chat(type, c) {
    let chat = this.state[type];
    chat.push({date: new Date(), ...c});
    this.setState({ [type]: chat });
    let e = document.getElementById(type);
    if (e && e.scrollTop >= e.scrollHeight - e.clientHeight - e.lastChild.clientHeight) {
      e.scrollTop = e.scrollHeight;
    }
  }

  getClueGiver() {
    if (this.state.state !== 'words') return null;
    if (this.state.rounds.length === 0) return null;
    return this.state.rounds[this.state.rounds.length - 1]['clue_giver'];
  }

  getSpyClueGiver() {
    if (this.state.state !== 'words') return null;
    if (this.state.rounds.length === 0) return null;
    return this.state.rounds[this.state.rounds.length - 1]['spy_clue_giver'];
  }

  toggleDrawer() {
    this.setState({ drawer: !this.state.drawer });
  }

  handleExpansion(round) {
    let self = this;
    return (event, isExpanded) => {
      self.setState({ expanded: isExpanded ? round : false });
    };
  }

  handleTabChange(event, newValue) {
    this.setState({ tab: newValue });
  }

  render() {
    const classes = this.props.classes;
    let team_a_jsx = [];
    let team_b_jsx = [];
    let host = this.state.host;
    let me = this.state.me;
    let clue_giver = this.getClueGiver();
    let spy_clue_giver = this.getSpyClueGiver();
    [[this.state.team_a, team_a_jsx], [this.state.team_b, team_b_jsx]].forEach(function (team) {
      team[0].forEach(function (player) {
        let show_badge = player === clue_giver || player === spy_clue_giver ? "CG" : 0;
        let color = me === player ? "textPrimary" : "textSecondary";
        team[1].push(
          <Grid xs item key={player}>
            <Badge badgeContent={show_badge} color="secondary" className={classes.padding}>
              <Typography component="h5" align="center" color={color} key={player}>{player}</Typography>
            </Badge>
            <Divider />
          </Grid>);
      });
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
            <Badge badgeContent={idx + 1} color="secondary">
              <Paper className={classes.card}>
                <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom>
                  {word}
                </Typography>
              </Paper>
            </Badge>
          </Grid>);
      });
    }

    let rounds = [];
    let self = this;
    this.state.rounds.forEach(function (round) {
      rounds.push(<Grid item key={round['number']}><Round
        round={round} me={me} expanded={self.state.expanded} handleExpansion={self.handleExpansion.bind(self)}
        setClues={self.set_field.bind(self, 'clues')}
        submitClues={self.submit_field.bind(self, 'clues')}
        setGuesses={self.set_field.bind(self, 'guesses')}
        submitGuesses={self.submit_field.bind(self, 'guesses')}
        setSpyGuesses={self.set_field.bind(self, 'spy_guesses')}
        submitSpyGuesses={self.submit_field.bind(self, 'spy_guesses')} /></Grid>);
    });

    let score = [];
    if (this.state.score) {
      score = (
        <Container>
          <Grid container justifyContent="center" spacing={1}>
            <Grid item>
              <Paper className={classes.padding}>
                <Typography variant="h6">Team A</Typography>
                <Typography>Intercepts: {this.state.score.team_a.intercepts}</Typography>
                <Typography>Miscommunications: {this.state.score.team_a.miscommunications}</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper className={classes.padding}>
                <Typography variant="h6">Team B</Typography>
                <Typography>Intercepts: {this.state.score.team_b.intercepts}</Typography>
                <Typography>Miscommunications: {this.state.score.team_b.miscommunications}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      );
    }

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
        <Dialog open={!this.state.connected}>
          <DialogContent>
            <Grid container justifyContent="center"><CircularProgress disableShrink /></Grid>
            <Typography component="h2" align="center">Waiting for WebSocket connection...</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={_ => window.location.reload(false)} color="primary">
              Refresh
          </Button>
          </DialogActions>
        </Dialog>
        <Container className={classes.heroContent}>
          <Container>
            {score}
          </Container>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
              {this.state.message}
            </Typography>
          </Container>
          <Container className={classes.heroButtons}>
            {buttons}
          </Container>
          <Container className={classes.icon}>
            <Grid container spacing={2} justifyContent="center">
              {words}
            </Grid>
          </Container>
        </Container>
        <Container>
          {rounds}
        </Container>
        <Container className={classes.bottomBar}>
          <AppBar elevation={0} className={classes.appBar} position="static">
            <Tabs value={this.state.tab} onChange={this.handleTabChange.bind(this)} scrollButtons="on" variant="scrollable">
              <Tab label="All Chat" index={0} />
              <Tab label="Team Chat" index={1} />
              <Tab label="Clue View" index={2} />
              <Tab label="Spy Clue View" index={3} />
            </Tabs>
          </AppBar>
          <TabPanel value={this.state.tab} index={0}>
            <Chat id='all_chat' className={classes.chatBox} sendchat={this.send_chat.bind(this, 'all_chat')} chat={this.state.all_chat} />
          </TabPanel>
          <TabPanel value={this.state.tab} index={1}>
            <Chat id='team_chat' className={classes.chatBox} sendchat={this.send_chat.bind(this, 'team_chat')} chat={this.state.team_chat} />
          </TabPanel>
          <TabPanel value={this.state.tab} index={2}>
            <ClueView clues={this.state.clue_view} />
          </TabPanel>
          <TabPanel value={this.state.tab} index={3}>
            <ClueView clues={this.state.spy_clue_view} />
          </TabPanel>
        </Container>
      </React.Fragment>
    );
  }
}

export default withSnackbar(withStyles(styles)(Game));
