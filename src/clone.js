/*!
 *
 * Copyright 2022 Square Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// this function conducts a dfs on the graph to identify cycles and
// to cut off nodes that reach the max depth. Without this function
// large graphs cause the page to crash. Nodes that are both max
// depth and cyclic are labeled as cyclic. Nodes that are both
// missing entities and max depth are labeled as missing.
export function _cloneNodes(node, depth = 1, path = [node._name]) {
  if (!node._deps || node._deps.length === 0) {
    return;
  }
  node.__visited = true;

  for (let i = 0; i < node._deps.length; i++) {
    const child = node._deps[i];
    path.push(child._name);

    // if this node has already been seen on this path before
    // we have identified a cycle. This is a cyclic node
    if (child.__visited) {
      const cyclicPaths = path.join(' → ')

      // if the child is already a clone
      if (child._isClone) {
        // and this path is not already included
        if (!child['Cyclic Dependency Paths'].includes(cyclicPaths)) {
          // add the path with a break
          child['Cyclic Dependency Paths'] += `<br>${cyclicPaths}`;
        }
      } else {
        // otherwise, clone and create the path for the first time
        this._cloneNodeCyclic(node, i, child, cyclicPaths);
      }
    // if the child is not a clone but has reached max depth
    } else if (depth >= this.options.maxDepth) {
      // and it is not a missing entity
      if (child._missing) { continue; }

      // and it does not have children
      if (!child._deps || child._deps.length === 0) { continue; }

      // clone it and mark it as max depth
      this._cloneNodeMaxDepth(node, i, child);

    // Otherwise, continue the recursion
    } else {
      this._cloneNodes(
        child,
        depth + 1,
        [...path],
      );
    }
  }

  // remove the visited label as we don't want to hit the
  // same node on a different path and think it's a cycle
  delete node.__visited;
}

export function _cloneNodeCyclic(node, i, child, cyclicPaths) {
  const { cyclicDependencyMessage } = this.options;
  let message;
  if (typeof cyclicDependencyMessage === 'string') {
    message = cyclicDependencyMessage;
  } else if (typeof cyclicDependencyMessage === 'function') {
    message = cyclicDependencyMessage(child);
  } else {
    message = 'This entity depends on another entity that has already been displayed up the branch. No more entities will be displayed here to prevent an infinite loop.';
  }

  const additionalProperties = {
    _isClone: true,
    _cyclic: true,
    'Automated Note': message,
    'Cyclic Dependency Paths': cyclicPaths,
  };

  this._cloneNode(node, i, child, additionalProperties);
}

export function _cloneNodeMaxDepth(node, i, child) {
  const { maxDepthMessage } = this.options;
  let message;
  if (typeof maxDepthMessage === 'string') {
    message = maxDepthMessage;
  } else if (typeof maxDepthMessage === 'function') {
    message = maxDepthMessage(child);
  } else {
    message = `Maximum depth of ${this.options.maxDepth} entities reached. This entity has additional children, but they cannot be displayed. Set this entity as the root to view additional dependencies.`
  }

  const additionalProperties = {
    _isClone: true,
    _maxDepth: true,
    'Automated Note': message,
  };

  this._cloneNode(node, i, child, additionalProperties);
}

export function _cloneNode(node, i, child, additionalProperties) {
  const clone = this._createNodeCopy(child, additionalProperties);
  this.clones.push([node, i, child]);
  node._deps[i] = clone;
}

export function _createNodeCopy(node, additionalProperties = {}) {
  const obj = {
    ...node,
    ...additionalProperties,
  };
  delete obj._deps;
  return obj;
}

export function _deleteClones() {
  let arr = this.clones.pop();
  while (arr) {
    const [parent, index, child] = arr;
    parent._deps[index] = child;
    arr = this.clones.pop();
  }
}
