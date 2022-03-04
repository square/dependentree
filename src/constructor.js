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

// takes a W3C Selector String
export function _constructor(elementSelectorString, userOptions = {}) {

  this.elementSelectorString = elementSelectorString;
  this.passedContainer = d3.select(elementSelectorString);
  this.passedContainerEl = this.passedContainer.node();

  if (!this.passedContainerEl) {
    throw new Error(
      `An element could not be selected from the given selector string "${elementSelectorString}". Please refer to https://www.w3.org/TR/selectors-api/ and ensure the element is on the page.`,
    );
  }

  if (userOptions.constructor.name !== 'Object') {
    throw new Error(
      `Argument options is not of type Object. Instead received a value of "${userOptions}". Please pass an empty object if you do not want to specify options.`,
    );
  }

  // We make one mutation to the passed container
  this.passedContainerEl.style.overflow = 'auto';

  // Another container element is made to be put inside of the passed container
  this.containerDiv = document.createElement('div');
  this.passedContainerEl.appendChild(this.containerDiv);
  this.container = d3.select(`${elementSelectorString} > div`);


  this._setOptions(userOptions);


  // sets container width depending on user options
  // passed in and original container element size
  const passedContainerWidth = this.passedContainerEl.getBoundingClientRect().width;
  const { marginLeft, marginRight } = this.options;

  if (this.options.containerWidthInPx !== null) {
    this.width = this.options.containerWidthInPx + marginLeft + marginRight;
  } else {
    this.width = passedContainerWidth * this.options.containerWidthMultiplier + marginLeft + marginRight;
  }

  // sets container width to size. The SVG element needs a
  // a set width size to scale the tree diagram correctly
  this.containerDiv.style.width = `${this.width}px`;
}
