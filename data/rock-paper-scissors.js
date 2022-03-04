module.exports = {
  rock: {
    _name: 'rock',
    _deps: ['paper']
  },
  paper: {
    _name: 'paper',
    _deps: ['scissors']
  },
  scissors: {
    _name: 'scissors',
    _deps: ['rock']
  },
};
