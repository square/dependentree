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

export function _entityHasProps({data}) {
  let count = 0;
  for (const key in data) {
    if (key[0] !== '_') {
      count++;
    }
  }
  return count > 0;
}

export function _mousemove(event, d) {
  if (this._entityHasProps(d)) {
    this.tooltip.style('visibility', 'visible');

    this.tooltip
      .style('top', `${event.clientY + 10}px`)
      .style('left', `${event.clientX + 10}px`)
  }
}

export function _mouseout() {
  this.tooltip.style('visibility', 'hidden');
}

export function _mouseover(event, d) {
  const {
    enableTooltipKey,
    tooltipColonStr,
    tooltipKeyStyleObj,
    tooltipColonStyleObj,
    tooltipValueStyleObj,
    tooltipItemStyleObj,
  } = this.options;

  const tooltipStyleStr = this._styleObjToStyleStr(tooltipItemStyleObj);
  const tooltipKeyStyleStr = this._styleObjToStyleStr(tooltipKeyStyleObj);
  const tooltipColonStyleStr = this._styleObjToStyleStr(tooltipColonStyleObj);
  const tooltipValueStyleStr = this._styleObjToStyleStr(tooltipValueStyleObj);

  let str = "<ul style='list-style-type:none;margin:0;padding:0'>";

  for (const key in d.data) {
    if (key[0] === '_') {
      continue;
    }
    const value = d.data[key];
    if (this._isNullOrUndef(value) || value === '') {
      continue;
    }

    const filteredKey = this._filterScriptInjection(key);

    const keyColon = enableTooltipKey
      ? `<span style=${tooltipKeyStyleStr}>${filteredKey}</span><span style=${tooltipColonStyleStr}>${tooltipColonStr}</span>`
      : '';

    const filteredVal = this._filterScriptInjection(value);

    str += `
      <li style='${tooltipStyleStr}'>
        ${keyColon}
        <span style=${tooltipValueStyleStr}>
          ${filteredVal}
        </span>
      </li>
    `;
  }
  str += '</ul>';

  this.tooltip.html(str);
}
