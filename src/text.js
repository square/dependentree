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


// function responsible for wrapping a node's text
// this is done by calculating the width of the text
// and slicing the text into different tspan
// elements that are stacked vertically.
export function _wrap(selection, width, splitStr) {
  selection.each(function () {
    const text = d3.select(this);

    let useSplitStr = false;
    let str = '';
    if (splitStr && typeof splitStr === 'string') {
      str = splitStr;
      useSplitStr = true;
    } else if (text.text().includes(' ')) {
      str = ' ';
    } else {
      str = '';
    }

    const words = text.text().split(str).reverse();
    const x = text.attr('x');
    const y = text.attr('y');
    let word;
    let line = [];
    let tspan = text
      .text(null)
      .append('tspan')
      .attr('x', x)
      .attr('y', y);

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(str));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        let joined = line.join(str);
        if (useSplitStr) {
          joined += splitStr;
        }

        // Edge case where text does not have split string.
        // This prevents an empty tspan from being added
        if (joined === str) { continue; }

        tspan.text(joined);
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', '1em')
          .text(word);
      }
    }
  });
}

// Get text direction refers to the direction
// for a downstream tree, which is understandably
// a bit confusing considering our default tree is
// upstream. This is the case because the default
// tidy tree diagram is left to right, for this
// library that means downstream
export function _getTextDirection(leftOrRight) {
  let orientation = 'start';
  let offset = this.options.textOffset;

  if (leftOrRight === 'left') {
    orientation = 'end';
    offset = -offset;
  };

  if (this.direction === 'upstream') {
    orientation = orientation === 'end' ? 'start' : 'end';
    offset = -offset;
  }

  return { orientation, offset }
}
