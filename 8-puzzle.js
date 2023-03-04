const { Queue, PriorityQueue } = require('dsa.js');

arrayShuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

arrayIsEqual = (a, b) => 
  Array.isArray(a) && 
  Array.isArray(b) &&
  a.length === b.length &&
  a.every((val, index) => val === b[index]);

translateTo2D = (index) => [Math.floor(index / 3), index % 3];

manhattanDistance = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

validActions = (state) => {
  var blankIndex = state.indexOf(0);
  var validActions = [];

  if (blankIndex > 2) {
    validActions.push('U');
  }

  if (blankIndex < 6) {
    validActions.push('D');
  }

  if (blankIndex % 3 > 0) {
    validActions.push('L');
  }

  if (blankIndex % 3 < 2) {
    validActions.push('R');
  }

  return validActions;
};

transform = (state, action) => {
  var newState = JSON.parse(JSON.stringify(state));
  var blankIndex = state.indexOf(0);

  switch (action) {
    case 'U':
      [newState[blankIndex], newState[blankIndex - 3]] = [newState[blankIndex - 3], newState[blankIndex]];
      break;
    case 'D':
      [newState[blankIndex], newState[blankIndex + 3]] = [newState[blankIndex + 3], newState[blankIndex]];
      break;
    case 'L':
      [newState[blankIndex], newState[blankIndex - 1]] = [newState[blankIndex - 1], newState[blankIndex]];
      break;
    case 'R':
      [newState[blankIndex], newState[blankIndex + 1]] = [newState[blankIndex + 1], newState[blankIndex]];
      break;
  }
  
  return newState;
};

inversions = (state) => {
  var inversionSum = 0;

  for (var i = 0; i < 9; i++) {
    for (var j = i + 1; j < 9; j++) {
      if (state[i] !== 0 && state[j] !== 0 && state[i] > state[j]) {
        inversionSum++;
      }
    }
  }

  return inversionSum;
};

ifSolvable = (state) => inversions(state) % 2 === 0;

createSolvableState = () => {
  var state = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  do {
    state = arrayShuffle(state);
  } while (!ifSolvable(state));

  return state;
};

solve = (state) => {
  var initialState = new BoardNode(state);
  var result1 = ASTAR(initialState);
  var result2 = BFS(initialState);

  return [result1, result2];
};

class Node {
  constructor(parent = null, depth = 0) {
    this.parent = parent;
    this.depth = depth;
    this.nodes = [];
  }

  addNode(node) {
    this.nodes.push(node);
  }

  iterateAncestors() {
    var ancestors = [];
    var currentNode = this;

    while (currentNode !== null) {
      ancestors.push(currentNode);
      currentNode = currentNode.parent;
    }

    return ancestors;
  }
}

class BoardNode extends Node {
  constructor(state, action = null, parent = null, depth = 0) {
    super(parent, depth);
    this.state = state;
    this.action = action;
    this.goal = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    this.heuristicFunc = manhattanDistance;
  }

  cost = () => {
    var heuristicSum = 0;

    for (var i = 0; i < this.state.length; i++) {
      var item = this.state[i];
      var [currentX, currentY] = translateTo2D(i);
      var [goalX, goalY] = translateTo2D(this.goal.indexOf(item));

      heuristicSum += this.heuristicFunc(currentX, currentY, goalX, goalY);
    }

    return heuristicSum + this.depth;
  };

  expand = () => {
    if (this.nodes.length === 0) {
      var actions = validActions(this.state);

      for (let action of actions) {
        var newState = transform(this.state, action);
        var newNode = new BoardNode(newState, action, this, this.depth + 1);
        this.addNode(newNode);
      }
    }
  };
  
  actions = () => this.iterateAncestors().map((node) => node.action).slice(0, -1).reverse();
  
  isGoal = () => arrayIsEqual(this.state, this.goal);
  
  print = () => this.state.toString();
}

ASTAR = (start) => {
  var comparator = (a, b) => a.cost() > b.cost();
  var frontier = new PriorityQueue([], comparator);
  var exploredNodes = new Set();
  var nodesExpanded = 0;
  var maxSearchDepth = 0;

  frontier.enqueue(start);
  
  while (frontier.size > 0) {
    node = frontier.dequeue();
    exploredNodes.add(node.state.toString());
    
    if (node.isGoal()) {
      return [node.actions(), nodesExpanded, maxSearchDepth];
    }
    
    node.expand();
    nodesExpanded++;

    for (let neighbor of node.nodes) {
      if (!exploredNodes.has(neighbor.state.toString())) {
        frontier.enqueue(neighbor);
        exploredNodes.add(neighbor.state.toString());
        
        if (neighbor.depth > maxSearchDepth) {
          maxSearchDepth = neighbor.depth;
        }
      }
    }
  }

  return null;
};

BFS = (start) => {
  var frontier = new Queue();
  var exploredNodes = new Set();
  var nodesExpanded = 0;
  var maxSearchDepth = 0;

  frontier.enqueue(start);
  
  while (frontier.size > 0) {
    node = frontier.dequeue();
    exploredNodes.add(node.state.toString());
    
    if (node.isGoal()) {
      return [node.actions(), nodesExpanded, maxSearchDepth];
    }

    node.expand();
    nodesExpanded++;
    
    for (let neighbor of node.nodes) {
      if (!exploredNodes.has(neighbor.state.toString())) {
        frontier.enqueue(neighbor);
        exploredNodes.add(neighbor.state.toString());

        if (neighbor.depth > maxSearchDepth) {
          maxSearchDepth = neighbor.depth;
        }
      }
    }
  }

  return null;
};

console.log(solve(createSolvableState()));
