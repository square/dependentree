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

// Expanding and collapsing the tree works by swapping
// children with _children and vice versa. _children is
// where collapsed children are stored. After the swap is made
// _update is called on the node which will generate the
// visual changed.

export function collapseAll(secondLevel = false) {
  if (!this.root) { return; }
  if (!this.root.children) { return; }
  if (this.root.children.length === 0) { return; }

  if (secondLevel) {
    // keeps the root's children open
    this.root.children.forEach(this._collapse.bind(this));
  } else {
    this._collapse(this.root);
  }
  this._update(this.root);
}

export function expandAll(levelsOfNodes = Infinity) {
  if (typeof levelsOfNodes !== 'number') {
    throw new TypeError('Arguments passed into expandAll must be of type number or undefined.');
  }

  if (levelsOfNodes > 5) {
    console.warn(
      'expandAll is not recommended for large dependency trees. This may cause layout trashing.',
    );
  }

  if (!this.root) { return; }
  if (this.root._children) {
    this.root.children = this.root._children;
    this.root._children = null;
  }
  const children = this.root.children;
  this._update(this.root);
  if (children) {
    children.forEach(child => this._delayExpand(child, levelsOfNodes - 1));
  }
}

export function removeTree() {
  if (this.svg) {
    this._deleteClones(this.root);
    this.svg.remove();
    this.tooltip.remove();
  }
}

export function _delayExpand(node, levelsOfNodes) {
  if (!node || levelsOfNodes === 1) { return; }
  setTimeout(() => {
    if (!node) { return; }
    if (node._children) {
      node.children = node._children;
      node._children = null;
    }

    this._update(node);
    if (node.children) {
      node.children.forEach(child => this._delayExpand(child, levelsOfNodes - 1));
    }
  }, this.options.animationDuration + 100);
}

export function _collapse(node) {
  if (!node) { return; }
  if (node.children) {
    node._children = node.children;
    node._children.forEach(this._collapse.bind(this));
    node.children = null;
  }
}

// Toggle dependencies on click.
export function _click(event, d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  this._update(d);
}

// Creates a curved (diagonal) path from parent to the child nodes
export function _diagonal(s, d) {
  return `
    M ${s.y} ${s.x}
    C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}
  `;
}
