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

const defaultOptions = {
  // behavior options
  animationDuration: 750,
  maxDepth: 25,
  enableTooltip: true,
  enableTooltipKey: true,
  modifyEntityName: null,
  textClick: null,
  maxDepthMessage: null,
  missingEntityMessage: null,
  cyclicDependencyMessage: null,

  // appearance options
  containerWidthMultiplier: 4,
  containerWidthInPx: null,
  marginTop: 60,
  marginRight: 120,
  marginBottom: 200,
  marginLeft: 120 ,
  parentNodeTextOrientation: 'left',
  childNodeTextOrientation: 'right',
  textOffset: 13,
  textStyleFont: '12px sans-serif',
  textStyleColor: 'black',
  circleStrokeColor: 'steelblue',
  circleStrokeWidth: 3,
  circleSize: 10,
  linkStrokeColor: '#dddddd',
  linkStrokeWidth: 2,
  closedNodeCircleColor: 'lightsteelblue',
  openNodeCircleColor: 'white',
  cyclicNodeColor: '#FF4242',
  missingNodeColor: '#E8F086',
  maxDepthNodeColor: '#A691AE',
  horizontalSpaceBetweenNodes: 180,
  verticalSpaceBetweenNodes: 30,
  wrapNodeName: true,
  splitStr: null,
  tooltipItemStyleObj: {
    'font-family': 'sans-serif',
    'font-size': '12px',
  },
  tooltipColonStr: ': ',
  tooltipKeyStyleObj: { 'font-weight': 'bold' },
  tooltipColonStyleObj: { 'font-weight': 'bold' },
  tooltipValueStyleObj: {},
  tooltipStyleObj: {
    'background-color': 'white',
    border: 'solid',
    'border-width': '1px',
    'border-radius': '5px',
    padding: '10px',
  },
};


export function _setOptions(userOptions) {
  for (const key in userOptions) {
    const opt = userOptions[key];
    if (typeof opt === 'string' && opt.includes('<') && opt.includes('>')) {
      throw new Error('Characters not allowed: "<" and ">" are not permitted as options to prevent script injection.')
    }
  }

  this.options = {
    ...defaultOptions,
    ...userOptions,
  }
}
