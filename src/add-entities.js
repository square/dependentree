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

export function addEntities(entities) {
  if (this.dependenciesAdded) {
    throw new Error('Entities have already been added. Create a new instance of DependenTree if you need to display other data.');
  }
  this._populateUpstream(entities);
  this._setPointersForUpstreamAndPopulateDownstream();
  this._setPointersForDownstream();
  this.dependenciesAdded = true;
}

// takes data and validates that each entity is valid.
// converts the array data format to the object data format
// if needed. This creates the initial upstream structure
export function _populateUpstream(data) {
  if (Array.isArray(data)) {
    // handles case where data structure is an array of objects, not keyed objects
    // creates keyed object structure
    data.forEach(obj => {
      this._typeCheckEntity(obj, null);

      if (this.upstream[obj._name]) {
        throw new Error(
          `Entity "${obj._name}" is duplicated in the input data. Ensure that every entity in the input data has a unique name.`
        );
      }

      this.upstream[obj._name] = obj;
    });
  } else {
    for (const key in data) {
      this._typeCheckEntity(data[key], key);
    }
    this.upstream = data;
  }
}

// This function goes through each _deps string in each upstream entity
// and replaces it with a pointer to that entity object
export function _setPointersForUpstreamAndPopulateDownstream() {
  // for in loop for speed
  for (const entityKey in this.upstream) {
    const upEntity = this.upstream[entityKey];

    // create corresponding downstream entity if does not exist yet
    if (this._isNullOrUndef(this.downstream[entityKey])) {
      this._addNode('downstream', upEntity);
    }

    // get dependencies if are any
    const upDeps = upEntity._deps;
    if (upDeps) {
      for (let i = 0; i < upDeps.length; i++) {
        const depStr = upDeps[i];

        // creates upstream objects if it does not exist yet
        if (this._isNullOrUndef(this.upstream[depStr])) {
          this._createMissingEntity(depStr);
        }
        // replaces string dependency with pointer to the corresponding entity object
        upDeps[i] = this.upstream[depStr];

        // same entity object, but now in downstream obj
        let downEntity;

        // creates downstream entity object with entityKey depStr if it does not exist yet
        if (this._isNullOrUndef(this.downstream[depStr])) {
          downEntity = this._addNode('downstream', this.upstream[depStr]);
        } else {
          downEntity = this.downstream[depStr];
        }

        // adds _deps array if does not exist
        if (this._isNullOrUndef(downEntity._deps)) {
          downEntity._deps = [];
        }

        const downDeps =  downEntity._deps;
        this._warnDuplicates(downDeps, depStr, entityKey);
        downDeps.push(entityKey);
      }
    }
  }
}

// does the string to pointer replacement but now for downstream objects
// this function is much simpler because all missing entities have been
// added in the above function
export function _setPointersForDownstream() {
  for (const entityKey in this.downstream) {
    const downEntity = this.downstream[entityKey];

    if (downEntity._deps) {
      this.downstream[entityKey]._deps.forEach((depStr, i) => {
        this.downstream[entityKey]._deps[i] = this.downstream[depStr];
      });
    }
  }
}

// Note that this function only checks the values of _name and _deps
// All other additional fields will be represented as strings in HTML
export function _typeCheckEntity(entity, key) {
  if (entity.constructor.name !== 'Object') {
    throw new Error(
      `Entity${ key ? ` "${key}" ` : ' ' }is not of type Object. Instead received a value of "${entity}".`
    );
  }

  const { _name, _deps } = entity;
  this._isValidNameStr(null, _name);

  // note that it's fine if _deps is undefined or null
  if (_deps !== undefined && _deps !== null && !Array.isArray(_deps)) {
    throw new Error(
      `"_deps" key in "${_name}" entity object is not of type array, undefined, or null. Instead received a value of "${_deps}".`
    );
  }

  // checks if the _deps of this node are valid strings too
  if (Array.isArray(_deps)) {
    _deps.forEach(depName => {
      this._isValidNameStr(_name, depName);
    });
  }
}

export function _isValidNameStr(parentStr, str) {
  if (this._isNullOrUndef(str) || typeof str !== 'string') {
    throw new Error(
      `"_name" key in entity object is not of type string. Instead received a value of "${str}" with a type of "${typeof str}".`
    );
  }

  if (str === '') {
    if (parentStr) {
      throw new Error(
        `Entity "${parentStr}" was found with an element in "_deps" containing an empty string. This is considered invalid. Ensure all dependencies in _deps are valid strings.`
      );
    }

    throw new Error(
      'An entity was found with a "_name" key as an empty string. This is considered invalid.'
    );
  }
}

export function _isNullOrUndef(ele) {
  return ele === null || ele === undefined;
}

export function _addNode(direction, node, additionalProperties) {
  const { _name } = node;
  // note that _createNodeCopy deletes _deps
  this[direction][_name] = this._createNodeCopy(node, additionalProperties);
  return this[direction][_name];
}

// Note that we only create missing entities in the upstream. They will
// automatically be added to downstream regardless of if they are missing in upstream
export function _createMissingEntity(name) {
  const { missingEntityMessage } = this.options;

  let message;
  if (typeof missingEntityMessage === 'string') {
    message = missingEntityMessage;
  } else if (typeof missingEntityMessage === 'function') {
    message = missingEntityMessage(name);
  } else {
    message = `"${name}" was not found in the input entity list and was added by the visualization library. This entity may have additional dependencies of its own.`
  }

  this.missingEntities.push(name);
  return this._addNode('upstream', { _name: name, _missing: true, 'Automated Note': message })
}

/*
Note that we only handle checking a duplicate key when populating downstream
But this is just a warning. We still set a duplicate pointer in both upstream
and downstream. The resulting nodes will look like this.
upstream: { _name: a, _deps: [b, c, c] }
downstream: { _name: c, _deps: [a, a] }
*/
export function _warnDuplicates(arr, depKey, parentKey) {
  if (arr.includes(parentKey)) {
    console.warn(
      `Entity "${parentKey}" has duplicate dependencies entities named "${depKey}".`,
    );
    const duplicateKey = `${parentKey} -> ${depKey}`;
    if (!this.dupDeps.includes(duplicateKey)) {
      this.dupDeps.push(duplicateKey);
    }
  }
}
