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


import * as d3 from 'd3';

// adds tree by choosing a key and upstream or downstream
export function setTree(key, direction = 'upstream') {
  if (direction !== 'upstream' && direction !== 'downstream') {
    throw new Error(
      `The second argument must be either "upstream" or "downstream". Instead received "${direction}".`
    );
  }

  const rootObj = this[direction][key];
  if (!rootObj) {
    throw new Error(`The entity "${key}" is not found.`);
  }

  this.direction = direction;
  this.removeTree();
  this._cloneNodes(this[direction][key]);

  // appends svg and group to page
  this.svg = this.container.append('svg');
  this.gLink = this.svg.append('g');

  this.svg.style('overflow', 'visible');

  // declares a tree layout and assigns the size
  // the second array element should be horizontalSpaceBetweenNodes
  // but we calculate this x position in ._update because we need to
  // invert it for the upstream trees (right to left trees)
  this.treeMap = d3.tree().nodeSize([this.options.verticalSpaceBetweenNodes, 0]);

  // specifies the entity in the graph we are selecting
  // and that _deps is where to find the children
  this.root = d3.hierarchy(this[direction][key], d => d._deps);
  this.root.x0 = 0
  this.root.y0 = 0;

  // Starts the tree closed. Without this,
  // all nodes will start completely expanded
  this.collapseAll(true);
  this._update(this.root);

  this._setTooltip();

  // moves the tree into view when switching
  // between upstream and downstream
  this.passedContainerEl.scrollLeft = this.direction === 'upstream' ? this.width : 0;
}
