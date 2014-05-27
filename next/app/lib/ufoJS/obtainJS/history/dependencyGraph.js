// this is what we already have, in a way
dependencies = {
    'A': ['B', 'C', 'D']
  , 'B': []
  , 'C': ['D', 'E']
  , 'D': ['F', 'G']
  , 'E': []
  , 'F': ['H', 'E'] //, 'C']
  , 'G': []
  , 'H': []//'H']
}


function Frame(node, hasDependencies) {
    this.node = node;
    this.visitDependencies = hasDependencies;
}

function prepareEvaluation(startNode, dependencies) {
    var stack = []
    , dependencyCount = {} // return value
    , dependents = {} // return value
    , entered = {} // detect circles
    , visited = {} // detect circles
    , path = [] // only needed for good error reporting
    , frame, node, length, i, dependency
    ;
    
    stack.push(new Frame(startNode, !!dependencies[startNode].length));
    dependents[startNode] = [];
    while(stack.length) {
        frame = stack[stack.length-1];
        node = frame.node;
        
        if(node in visited) {
            stack.pop(); // clear frame
            continue;
        }
        
        if(frame.visitDependencies && (node in entered)) {
            // throw new Error()
            
            // I think a direct error is better here. However, we could
            // collect all found strongly connected components and return
            // these. That might ease debugging or make it harder.
            console.log('CIRCLE!'
                        , 'current node:', node
                        , 'path:', path.join('->')
                        , 'strongly connected component:'
                        , path.slice(path.indexOf(node)).concat([node]).join('->'));
            
            stack.pop(); // clear frame
            continue;
        }
        
        path.push(node);
        
        dependencyCount[node] = length = dependencies[node].length;
        
        if(frame.visitDependencies) {
            // entering the nodes dependencies
            entered[node] = null;
            frame.visitDependencies = false;
            
            for(i=0; i<length; i++) {
                dependency = dependencies[node][i];
                
                // create the transpose graph
                if(!(dependency in dependents))
                    dependents[dependency] = [];
                // node is a dependent of dependency
                dependents[dependency].push(node);
                
                if(dependency in visited)
                    // shortcut: this will be detected at the beginning of
                    // the while loop anyways, so we save us from creating,
                    // pushing and then popping the frame
                    continue;
                
                // create a new frame
                // Frame.entering is true when the dependency has any dependencies
                stack.push(new Frame(dependency, !!dependencies[dependency].length));
            }
        }
        else {
            // leaving the node
            visited[node] = null;
            path.pop();
            stack.pop();
        }
    }
    return [dependencyCount, dependents]
}

// our starting point is A
var result = prepareEvaluation('A', dependencies);

// dependencyCount and dependentsOf is what we want to create:
dependencyCount = {
    'A': 3
  , 'B': 0
  , 'C': 2
  , 'D': 2
  , 'E': 0
  , 'F': 2
  , 'G': 0
  , 'H': 0
}
dependents = {
    'H': ['F']
  , 'G': ['D']
  , 'F': ['D']
  , 'E': ['F', 'C']
  , 'D': ['C', 'A'] // read dependents of D are C and A
  , 'C': ['A']
  , 'B': ['A']
  , 'A': []
}


console.log(dependencyCount, result[0]);
console.log('///////////////////////////')
console.log(dependents, result[1]);

// every dependency with a count of 0 can be executed immediately
// we first execute all asynchronous dependencies, as these probably dispatch to
// a server or such and run nonblocking (hopefully, where is the point otherwise?):
//
// for all dependencies
// if one of the dependencies dependencyCount is at zero
//      and async it is dispatched immediately
//      and sync it is pushed to the stack of sync dependencies to be executed
//
// now we execute the dependencies from the stack of sync dependencies to be executed
// one by one
// after executing a sync dependency we use dependents to decrease the dependencyCount
// of the other dependencies
// if one of the other dependencies is at zero
//      and async it is dispatched immediately
//      and sync it is pushed to the stack of sync dependencies to be executed
// when we are out of sync dependencies but waiting for async ones, their callbacks will
// have to invoke this process again.
//
//   while(sosd.length)
//      d = sosd.pop()
//      execute(d);
//      for dependent in dependents[d]
//            dependencyCount[dependent] -= 1
//            if(dependencyCount[dependent] === 0)
//                 if isSync(dependent) sosd.push(dependent)
//                 else execute(dependent)
//
// FIXME: when n async operations are dispatched and any operation
// raises an error/invokes errback, how to proceed with the yet open
// operations (that are about to fail or resolve successfully)
// or that might be in a queue waiting to be executed when another async
// op using the same resource finishes (ajax with limited paralell connections)
// XMLHttpRequest has an abort() method. so the async methods might return such
// an API. However without such an api we can just sit and wait for the
// methods to finish, ignoring the results (or updating an error status)
// It may be optional upon creation of the obtain method whether async
// calls may be fired/executed consecutively or asap



