module.exports = [
  {
    _name: 'Elizabeth II',
    Title: 'Queen',
  },
  {
    _name: 'Phillip',
    Title: 'Duke of Edinburgh',
  },
  {
    _name: 'Charles',
    _deps: ['Phillip', 'Elizabeth II'],
    Title: 'Prince of Wales',
    _shortTitle: 'Prince',
  },
  {
    _name: 'Diana',
    Title: 'Princess of Wales',
    _shortTitle: 'Princess',
  },
  {
    _name: 'William',
    _deps: ['Diana', 'Charles'],
    Title: 'Prince, Duke of Cambridge',
    _shortTitle: 'Prince',
  },
  {
    _name: 'Catherine',
    Title: 'Duchess of Cambridge',
  },
  {
    _name: 'George',
    _deps: ['Catherine', 'William'],
    _shortTitle: 'Prince',
  },
  {
    _name: 'Charlotte',
    _deps: ['Catherine', 'William'],
    _shortTitle: 'Princess',
  },
  {
    _name: 'Louis',
    _deps: ['Catherine', 'William'],
    _shortTitle: 'Prince',
  },
  {
    _name: 'Harry',
    _deps: ['Diana', 'Charles'],
    Title: 'Prince, Duke of Sussex',
    _shortTitle: 'Prince',
  },
  {
    _name: 'Meghan Markle',
    Title: 'Duchess of Sussex',
  },
  {
    _name: 'Archie Harrison Mountbatten-Windsor',
    _deps: ['Meghan Markle', 'Harry'],
  },
  {
    _name: 'Anne',
    _deps: ['Phillip', 'Elizabeth II'],
    Title: 'Princess Royal',
    _shortTitle: 'Princess',
  },
  {
    _name: 'Mark Phillips',
    Title: 'Captain',
  },
  {
    _name: 'Peter Phillips',
    _deps: ['Mark Phillips','Anne'],
  },
  {
    _name: 'Autumn Kelly',
  },
  {
    _name:  'Savannah Phillips',
    _deps: ['Autumn Kelly','Peter Phillips']
  },
  {
    _name: 'Isla Phillips',
    _deps: ['Autumn Kelly','Peter Phillips']
  },
  {
    _name: 'Zara Tindall',
    _deps: ['Mark Phillips', 'Anne'],
  },
  {
    _name: 'Mike Tindall',
  },
  {
    _name: 'Mia Grace Tindall',
    _deps: ['Mike Tindall','Zara Tindall'],
  },
  {
    _name: 'Lena Elizabeth Tindall',
    _deps: ['Mike Tindall','Zara Tindall'],
  },
  {
    _name: 'Andrew',
    _deps: ['Phillip', 'Elizabeth II'],
    Title: 'Prince, Duke of York',
    _shortTitle: 'Prince',
  },
  {
    _name: 'Sarah',
    Title: 'Duchess of York',
  },
  {
    _name: 'Beatrice',
    _deps: ['Sarah', 'Andrew'],
  },
  {
    _name: 'Eugenie',
    _deps: ['Sarah', 'Andrew'],
  },
  {
    _name: 'Edward',
    _deps: ['Phillip', 'Elizabeth II'],
    Title: 'Prince, Earl of Wessex',
    _shortTitle: 'Prince',
  },
  {
    _name: 'Sophie Rhys-Jones',
    Title: 'Countess of Wessex',
  },
  {
    _name: 'James',
    Title: 'Viscount Severn',
    _deps: ['Edward', 'Sophie Rhys-Jones'],
  },
  {
    _name: 'Louise Windsor',
    Title: 'Lady',
    _deps: ['Edward', 'Sophie Rhys-Jones'],
  },
];
