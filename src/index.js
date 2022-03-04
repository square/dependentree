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


class DependenTree {
  constructor(elementSelectorString, userOptions) {
    this._constructor(elementSelectorString, userOptions);

    // default class properties, declared here to ensure these are new
    // objects in memory every time a new class instance is created
    this.nodeId = 0;
    this.upstream = {};
    this.downstream = {};
    this.missingEntities = [];
    this.dupDeps = [];
    this.keysMemo = {};
    this.clones = [];
  }
};

Object.assign(
  DependenTree.prototype,
  require('./clone'),
  require('./constructor'),
  require('./add-entities'),
  require('./helpers'),
  require('./mouse'),
  require('./options'),
  require('./text'),
  require('./tree-helpers'),
  require('./set-tree'),
  require('./update'),
  require('./validate'),
);

export default DependenTree;
