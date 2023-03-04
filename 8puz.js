
translateTo2D = index => {
    return [Math.floor(index / 3), index % 3];
}

manhattanDistance = (x1, y1, x2, y2) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

validActions = (state) => {
    var blankIndex = state.indexOf(0);
    var validActions = [];

    if (blankIndex > 2) {
        validActions.push("U");
    }
    
    if (blankIndex < 6) {
        validActions.push("D");
    }
    
    if (blankIndex % 3 > 0) {
        validActions.push("L");
    }
    
    if (blankIndex % 3 < 2) {
        validActions.push("R");
    }

    return validActions;
}

transform = (state, action) => {
    var newState = JSON.parse(JSON.stringify(state))
    var blankIndex = state.indexOf(0);

    if (action ===  "U") {
        [newState[blankIndex], newState[blankIndex - 3]] = [newState[blankIndex - 3], newState[blankIndex]];
        //swapElements(newState, blankIndex, blankIndex - 3)
    } else if (action ===  "D") {
        [newState[blankIndex], newState[blankIndex + 3]] = [newState[blankIndex + 3], newState[blankIndex]];
        //swapElements(newState, blankIndex, blankIndex + 3)
    } else if (action ===  "L") {
        [newState[blankIndex], newState[blankIndex - 1]] = [newState[blankIndex - 1], newState[blankIndex]];
        //swapElements(newState, blankIndex, blankIndex - 1)
    } else if (action ===  "R") {
        [newState[blankIndex], newState[blankIndex + 1]] = [newState[blankIndex + 1], newState[blankIndex]];
        //swapElements(newState, blankIndex, blankIndex + 1)
    }
    
    return newState;
}

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
}

ifSolvable = state => {
    return inversions(state) % 2 === 0;
}


shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    
    return array;
}

swapElements = (array, index1, index2) => {
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
};

createSolvableState = () => {
    var state = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    do {
        state = shuffle(state);
    }
    while (!ifSolvable(state));

    return state;
}

solve = (state) => {
    var initialState = new BoardNode(state);
    var result = BFS(initialState);

    //return result;
    return result[0].actions();
}

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
    }

    expand = () => {
        if (this.nodes.length === 0) {
            var actions = validActions(this.state);

            for (let action of actions) {
                var newState = transform(this.state, action);
                var newNode = new BoardNode(newState, action, this, this.depth + 1);
                this.addNode(newNode);
            }
        }
    }

    actions = () => {
        var actions = [];
        
        for (let node of this.iterateAncestors()) {
            actions.push(node.action);
        }
        
        actions.pop();
        actions.reverse();
        
        return actions;
    }

    isGoal = () => {
        return arrayEquals(this.state, this.goal);
    }

    print = () => {
        return this.state.toString();
    }
};

arrayEquals = (a, b) => {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

BFS = start => {
    var frontier = []
    var exploredNodes = new Set();
    var nodesExpanded = 0;
    var maxSearchDepth = 0;

    frontier.push(start);

    while (frontier.length > 0) {
        node = frontier.shift();
        exploredNodes.add(node.state.toString());

        //console.log(node.state)

        if (node.isGoal()) {
            return [node, nodesExpanded, maxSearchDepth];
        }

        node.expand();
        nodesExpanded++;
        
        for (let neighbor of node.nodes) {
            if (!exploredNodes.has(neighbor.state.toString())) {
                frontier.push(neighbor);
                exploredNodes.add(neighbor.state.toString());
                
                if (neighbor.depth > maxSearchDepth) {
                    maxSearchDepth = neighbor.depth;
                }
            }

            //console.log(neighbor.state);
        }
    }

    return null;
}

/**
console.log(translateTo2D(10));
console.log(manhattanDistance(1, 2, 1, 2));
console.log(validActions([1, 2, 3, 4, 5, 6, 7, 8, 0]));
console.log(transform([1, 2, 3, 4, 5, 6, 7, 8, 0], "U"));
console.log(inversions([1, 2, 3, 4, 5, 6, 7, 8, 0]));
console.log(ifSolvable([1, 2, 3, 4, 5, 6, 7, 8, 0]));
console.log(shuffle([1, 2, 3]));
//console.log(createSolvableState());
**/

//var node = new BoardNode(createSolvableState());
//console.log(node.cost());
//console.log(node.iterateAncestors());
//console.log(node.actions());
//console.log([1, 2, 3].indexOf(2));

console.log(solve([1, 2, 5, 3, 4, 0, 6, 7, 8]))
console.log(solve(createSolvableState()));