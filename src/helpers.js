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

export function getEntityList(key = null, value = null) {
  if (key !== null && key !== undefined && typeof key !== 'string') {
    throw new Error(
      `The first argument (key) must be a string or undefined. Instead, a value of "${key}" was received with type "${typeof key}".`
    );
  }

  if (value !== null && value !== undefined && typeof value !== 'string') {
    throw new Error(
      `The second argument (value) must be a string or undefined. Instead, a value of "${value}" was received with type "${typeof value}".`
    );
  }

  const memoKey = `${key}---${value}`;
  if (this.keysMemo[memoKey]) {
    return this.keysMemo[memoKey];
  }

  let list = [];

  if (key === null || value === null) {
    list = Object.keys(this.upstream);
  } else {
    const entities = this.upstream;
    for (const name in entities) {
      if (entities[name][key] === value) {
        list.push(name);
      }
    }
  }

  this.keysMemo[memoKey] = list;
  return list;
}

export function _setTooltip() {
  this.tooltip = d3
    .select(this.elementSelectorString)
    .append('div')
    .style('position', 'fixed')
    .style('visibility', 'hidden');

  for (const key in this.options.tooltipStyleObj) {
    this.tooltip.style(key, this.options.tooltipStyleObj[key]);
  }
}

export function _styleObjToStyleStr(obj) {
  let str = '';
  for (const key in obj) {
    str += `${key}:${obj[key]};`;
  }
  return str;
}

export function _filterScriptInjection(input) {
  if (typeof input !== 'string') {return input;}
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
