# DependenTree

A graph visualization library built on top of D3. Displays a directed graph in a collapsible tree format. Users can view information about graph nodes (entities) and their dependencies.

## Table of Contents

- [DependenTree](#dependentree)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Live Code Playground](#live-code-playground)
  - [Quickstart](#quickstart)
  - [Terminology](#terminology)
  - [API](#api)
    - [Methods](#methods)
    - [Method Arguments](#method-arguments)
    - [Options](#options)
      - [Tree Behavior](#tree-behavior)
      - [Tree Appearance](#tree-appearance)
    - [Validate](#validate)
  - [Input Data Format](#input-data-format)
    - [Array Example](#array-example)
    - [Object Example](#object-example)
    - [Entity Object Format](#entity-object-format)
      - [Fields](#fields)
      - [Additional Fields](#additional-fields)
      - [Added Fields](#added-fields)
  - [Understanding Max Depth](#understanding-max-depth)
    - [Hypothetical Example](#hypothetical-example)
    - [Real Example](#real-example)
    - [Another Hypothetical](#another-hypothetical)
  - [Examples](#examples)
    - [`modifyEntityName`](#modifyentityname)
    - [`textClick`](#textclick)
    - [Form Example](#form-example)
  - [Resources](#resources)

## Features

- Visualize large dependency graphs, tested up to 14K nodes
- Supports visualization of cyclic graphs
- See both upstream and downstream dependencies
- Handle all graph mapping logic on the client-side
- Only requires a minimal input of node and edge data
- Simple API, no need to write D3 code

## Live Code Playground

Start with this [interactive walkthrough](https://observablehq.com/@amogh/dependentree) to learn about the library and its features.

## Quickstart

**DependenTree** takes graph data in JSON format. Construct your graph with the following API

```json
[
 {
    "_name": "Elizabeth II",
    "Title": "Queen"
  },
  {
    "_name": "Phillip",
    "Title": "Duke of Edinburgh"
  },
  {
    "_name": "Charles",
    "_deps": ["Phillip", "Elizabeth II"],
    "Title": "Prince of Wales"
  },
  {
    "_name": "Diana",
    "Title": "Princess of Wales"
  },
  {
    "_name": "William",
    "_deps": ["Diana", "Charles"],
    "Title": "Prince, Duke of Cambridge"
  },
  {
    "_name": "Catherine",
    "Title": "Duchess of Cambridge"
  },
  {
    "_name": "George",
    "_deps": ["Catherine", "William"]
  },
  {
    "_name": "Charlotte",
    "_deps": ["Catherine", "William"]
  },
  {
    "_name": "Louis",
    "_deps": ["Catherine", "William"]
  }
]
```

Above is a small graph of nine entities; in this case the data is people in a family tree. You'll note that each of the  children have their parents as dependencies. These dependencies are represented as an array of strings under the `_deps` key. These strings exactly match the `_name` of another entity. When this data is displayed Their `_name` will be displayed on the tree. Their `Title` will be displayed on a tooltip when hovering over each entity node.

```html
<html>
  <head>
    <style>
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      body,
      html {
        height: 100vh;
        width: 100%;
        overflow: auto;
      }
    </style>
  </head>
  <body><div id="tree"></div></body>
  <script type="text/javascript" src="dependentree.js"></script>
  <!-- For this example, the JSON array is parsed and saved as a JavaScript variable called royals -->
  <script type="text/javascript" src="royals.js"></script>
  <script>
    // Creates an instance of the class
    // The tree attaches to the body element
    const tree = new DependenTree('div#tree');

    // Adds dependency data to the tree
    tree.addEntities(royals);

    // Sets the entity on the tree, displays the upstream dependencies
    // You can also pass 'downstream' to display downstream dependencies
    tree.setTree('Elizabeth II', 'upstream');
  </script>
</html>
```

DependenTree is exported in the universal module definition format.

Install with  npm or yarn

```sh
npm install @square/dependentree

yarn add @square/dependentree
```

Import the `DependenTree` class

```javascript
// import class as a module
import DependenTree from '@square/dependentree';

// or if using require, the class will be found under default
const DependenTree = require('@square/dependentree').default;


import royals from './testData';

// Creates an instance of the class
// The tree attaches to our designated element
const tree = new DependenTree('div#tree');

// Adds dependency data to the tree
tree.addEntities(royals);

// Sets the entity on the tree, displays the upstream dependencies
// You can also pass 'downstream' to display downstream dependencies
tree.setTree('Elizabeth II', 'upstream');
```

## Terminology

| Term        |                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entity      | Entities are nodes in a graph. If our graph represents a family tree, an entity would be an individual person. Entities are unique to the graph.     |
| Entity Data | Refers to the JavaScript object that represents the information about the entity including it's name and list of dependencies.                       |
| Graph       | The graph which represents the dependency relationships. The graph exists in memory. A portion of data from the graph is pulled to create each tree. |
| Tree        | The visual tree structure on the page.                                                                                                               |
| Node        | An individual node on the visual tree structure. Nodes consist of text and a circular button. Each entity can have multiple nodes on a page.         |


## API

### Methods

| Method          | Example                                           | Description                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constructor`   | `new DependenTree('div#tree', {maxDepth: 25});`   | Creates an instance of the DependenTree class. It attaches to an HTML element on the page and passes [tree options](#options) to change the tree's appearance.                                                                                                      |
| `addEntities`   | `[{ "_name": "Elizabeth II", "Title": "Queen" }]` | List of entities and their dependencies. See the [Input Data Format](#input-data-format) section below.                                                                                                                                                             |
| `setTree`       | `.setTree('Elizabeth II', 'downstream');`         | Sets a new tree diagram to be displayed in the target HTML element. Also removes any previous tree in the target element.                                                                                                                                           |
| `removeTree`    | `.removeTree();`                                  | Removes the tree currently being displayed.                                                                                                                                                                                                                         |
| `expandAll`     | `.expandAll(4);`                                  | Opens all nodes in the tree up to the target depth represented as an integer. If no target depth is passed in, all nodes will be expanded. This method is not recommended for large trees. You are likely to experience layout thrashing and possibly a page crash. |
| `collapseAll`   | `.collapseAll();`                                 | Collapses all nodes. If `true` is passed in, the second level remains open along with the root node.                                                                                                                                                                |
| `getEntityList` | `.getEntityList('Title', 'Prince');`              | Returns a list of entities based on a `key: value` filter. If no filter is passed in, all entities will be returned.                                                                                                                                                |
| `validate`      | `.validate();`                                    | After passing data to `addEntities`, `validate` provides information about the quality of your input data. See [validate](#validate) section below.                                                                                                                 |

### Method Arguments

| Method          | Argument        | Type            | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | --------------- | --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constructor`   | Selector String | String          | Yes      | [W3C Selector String](https://www.w3.org/TR/selectors-api/) for selecting your container element. This element is given a style of `overflow:auto;`. The tree will be appended to this element. Be sure to define this element's width before calling DependenTree. It is also best not to use the body element. An element that is a descendant of body works best. If you use the body, there may be issues with the automatic scrolling feature when switching between upstream and downstream. |
|                 | Options         | Object          | No       | Options to modify the graph appearance. See the [Options documentation](#options) below.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `addEntities`   | Dependencies    | Object or Array | Yes      | List of entities and their dependencies. See the [Input Data Format](#input-data-format) section below.                                                                                                                                                                                                                                                                                                                                                                                            |
| `setTree`       | Entity Name     | String          | Yes      | The entity that will be the root node of the dependency tree.displayed.                                                                                                                                                                                                                                                                                                                                                                                                                            |
|                 | Direction       | String          | No       | This string sets whether the `'upstream'` or `'downstream'` dependencies of a given entity are displayed. This argument defaults to `'upstream'`.                                                                                                                                                                                                                                                                                                                                                  |
| `removeTree`    | n/a             | n/a             | No       | n/a                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `expandAll`     | Target Depth    | Integer         | No       | This field expands all the nodes to a given depth. If no depth argument is passed in, all nodes in the tree will be expanded.                                                                                                                                                                                                                                                                                                                                                                      |
| `collapseAll`   | Second Level    | Boolean         | No       | If `true` is passed in, the second level will remain open along with the first.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `getEntityList` | Key             | String          | No       | The `key` of which to filter by. E.g. `'Title'`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|                 | Value           | String          | No       | The `value` of which to filter by. E.g. `'Queen'`.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `validate`      | n/a             | n/a             | No       | n/a                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

### Options

In the constructor, DependenTree takes an options object. The various options control how the tree looks and behaves. Note that options passed into the the constructor will not be checked to ensure the values are valid. Options will be checked for the "<" and ">" characters. These characters are not permitted to prevent script injection. If options are not passed in, the following default values will be used instead. Options are categorized as impacting the behavior of the tree or the appearance of the tree but can be specified in any order.

[Experiment with options live.](https://observablehq.com/@amogh/dependentree#cell-602)

#### Tree Behavior

| Name                      | Type               | Default Value | Description                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `animationDuration`       | Integer            | `750`         | How many milliseconds a node movement animation lasts.                                                                                                                                                                                                                                                                                                         |
| `maxDepth`                | Integer            | `25`          | See the [Understanding Max Depth Nodes](#understanding-max-depth-nodes) section.                                                                                                                                                                                                                                                                               |
| `enableTooltip`           | Boolean            | `true`        | Enables a tooltip with additional information about each entity when the node is hovered over.                                                                                                                                                                                                                                                                 |
| `enableTooltipKey`        | Boolean            | `true`        | If set to `true`, the key in each key value pair of additional entity information will be displayed. For example: `Title: Queen` as opposed to simply `Queen`.                                                                                                                                                                                                 |
| `modifyEntityName`        | Function           | `null`        | A function which is passed the entity data object and should return a string representing the what the node text will be. The default value for `_name` will be passed in if this variable is `null`. See the [modifyEntityName](#modifyentityname) example below.                                                                                             |
| `textClick`               | Function           | `null`        | A function passed as a callback when users click on the text of the node. This method is passed two arguments, [mouse event](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) and the [entity data](#terminology) object. If this value is `null`, clicking the text will expand/collapse the node. See the [textClick](#textclick) example below. |
| `maxDepthMessage`         | String or Function | `null`        | Overwrites the max depth message when not `null`. If this option is set to a function, the entity data object will be passed in to the function as an argument; this function should return a string.                                                                                                                                                          |
| `missingEntityMessage`    | String or Function | `null`        | Overwrites the default missing entity message when not `null`. If this option is set to a function, the missing entity's name will be passed in to the function as an argument; this function should return a string.                                                                                                                                          |
| `cyclicDependencyMessage` | String or Function | `null`        | Overwrites the default cyclic dependency loop message when not `null`. If this option is set to a function, the entity data object will be passed in to the function as an argument; this function should return a string.                                                                                                                                     |

#### Tree Appearance

| Name                          | Type    | Default Value                                                                                                    | Description                                                                                                                                                                                                                                                                                                                             |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `containerWidthMultiplier`    | Number  | `4`                                                                                                              | The tree takes the default width of the HTML element passed into the selector string and multiplies it by the `containerWidthMultiplier`. It's usually best not to reduce this value. The tree's scale is determined by the width of the container. If you do reduce this value, you may need to adjust the size of the nodes and text. |
| `containerWidthInPx`          | Integer | `null`                                                                                                           | Sets the container width with a constant pixel value. This overrides `containerWidthMultiplier` if the value is not `null`. Take caution with setting this value too low. See the note above.                                                                                                                                           |
| `marginTop`                   | Integer | 60                                                                                                               | Sets the `margin-top` of the tree's wrapping SVG element.                                                                                                                                                                                                                                                                               |
| `marginRight`                 | Integer | 120                                                                                                              | Sets the `margin-right` of the tree's wrapping SVG element.                                                                                                                                                                                                                                                                             |
| `marginBottom`                | Integer | 200                                                                                                              | Sets the `margin-bottom` of the tree's wrapping SVG element.                                                                                                                                                                                                                                                                            |
| `marginLeft`                  | Integer | 120                                                                                                              | Sets the `margin-left` of the tree's wrapping SVG element.                                                                                                                                                                                                                                                                              |
| `parentNodeTextOrientation`   | String  | `'left'`                                                                                                         | Sets the placement of text for a given node that has children. The direction refers to downstream dependencies. This is inverted for upstream.                                                                                                                                                                                          |
| `childNodeTextOrientation`    | String  | `'right'`                                                                                                        | Sets the placement of text for a given node that has no children. The direction refers to downstream dependencies. This is inverted for upstream.                                                                                                                                                                                       |
| `textOffset`                  | Integer | `13`                                                                                                             | How far the placement of the text is from the center of the node in pixels.                                                                                                                                                                                                                                                             |
| `textStyleFont`               | String  | `'12px sans-serif'`                                                                                              | Node text's [shorthand property](https://developer.mozilla.org/en-US/docs/Web/CSS/font).                                                                                                                                                                                                                                                |
| `textStyleColor`              | String  | `'black'`                                                                                                        | Node text's [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).                                                                                                                                                                                                                                                      |
| `circleStrokeColor`           | String  | `'steelblue'`                                                                                                    | Outline [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the node circle.                                                                                                                                                                                                                                       |
| `circleStrokeWidth`           | Integer | `3`                                                                                                              | Width of the node circle in pixels.                                                                                                                                                                                                                                                                                                     |
| `circleSize`                  | Integer | `10`                                                                                                             | Size of the node's circle in pixels.                                                                                                                                                                                                                                                                                                    |
| `linkStrokeColor`             | String  | `'#dddddd'`                                                                                                      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the link. A link is the line that connects nodes.                                                                                                                                                                                                              |
| `linkStrokeWidth`             | Integer | `2`                                                                                                              | With of the link in pixels.                                                                                                                                                                                                                                                                                                             |
| `closedNodeCircleColor`       | String  | `'lightsteelblue'`                                                                                               | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the circle when the node has children and is closed.                                                                                                                                                                                                           |
| `openNodeCircleColor`         | String  | `'white'`                                                                                                        | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the circle when the node has children and is closed or when the node has no children.                                                                                                                                                                          |
| `cyclicNodeColor`             | String  | `'#FF4242'`                                                                                                      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the circle of nodes that have cyclic dependency loops.                                                                                                                                                                                                         |
| `missingNodeColor`            | String  | `'#E8F086'`                                                                                                      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the circle of nodes that were not included in the input entity list but found as a dependency.                                                                                                                                                                 |
| `maxDepthNodeColor`           | String  | `'#A691AE'`                                                                                                      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) of the circle of nodes that mark the end of the tree that can be displayed.                                                                                                                                                                                       |
| `horizontalSpaceBetweenNodes` | Integer | `180`                                                                                                            | Sets the horizontal space between each level of nodes in pixels.                                                                                                                                                                                                                                                                        |
| `verticalSpaceBetweenNodes`   | Integer | `30`                                                                                                             | Sets the vertical space between each level of nodes in pixels. Note that this will be the minimum vertical space. The actual spacing will depend on the tree layout.                                                                                                                                                                    |
| `wrapNodeName`                | Boolean | `true`                                                                                                           | If the width of a node's name is greater than the `horizontalSpaceBetweenNodes * 0.75`, then the node text will wrap if `true`.                                                                                                                                                                                                         |
| `splitStr`                    | String  | `null`                                                                                                           | This string is used to split the name of an entity the width is greater than `horizontalSpaceBetweenNodes * 0.75`. For example, `splitStr = '_'` will result in `"foo_bar_baz"` becoming `"foo_bar" "_baz"` split onto two separate lines if the entity name string is too long.                                                        |
| `tooltipItemStyleObj`         | Object  | `{'font-family': 'sans-serif', 'font-size': '12px'}`                                                             | Accepts a JavaScript object of CSS styles for each tooltip info row.                                                                                                                                                                                                                                                                    |
| `tooltipStyleObj`             | Object  | `{'background-color': 'white', border: 'solid', 'border-width': '1px', 'border-radius': '5px', padding: '10px'}` | Accepts a JavaScript object of CSS styles for the tooltip element. element.                                                                                                                                                                                                                                                             |
| `tooltipColonStr`             | String  | `': '`                                                                                                           | The string that separates the key from the value. Another possible option for this value could be `" - "`.                                                                                                                                                                                                                              |
| `tooltipKeyStyleObj`          | Object  | `{'font-weight': 'bold'}`                                                                                        | Accepts a JavaScript object of CSS styles for each tooltip info item key.                                                                                                                                                                                                                                                               |
| `tooltipColonStyleObj`        | Object  | `{'font-weight': 'bold'}`                                                                                        | Accepts a JavaScript object of CSS styles for each tooltip info item colon.                                                                                                                                                                                                                                                             |
| `tooltipValueStyleObj`        | Object  | `{}`                                                                                                             | Accepts a JavaScript object of CSS styles for each tooltip info item value.                                                                                                                                                                                                                                                             |

### Validate
Validate returns an object with information about the quality of your input data

| Field                     | Meaning                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `noDuplicateDependencies` | Ensures that entities do not have any of the same children listed twice.                                                                         |
| `duplicateDependencies`   | A list of the entities that have children listed twice in the following format `'entity -> dependency'`.                                         |
| `noMissingEntities`       | Indicates if entities are have dependencies that are not found on the top level input data.                                                      |
| `missingEntities`         | A list of the entities that that are not found on the top level of input data. These entities were found in another entity's dependency list.    |
| `noCycles`                | Indicates if there are cyclic dependencies. This value is not inherently negative depending on what what type of entities are being represented. |

## Input Data Format

The `addEntities` method expects the data as either an `Array` or an `Object` of entity objects. Once passed into the `addEntities` method will convert the `Array` format to the `Object` format, so it's best to use the `Object` format if possible.

**Note:** DependenTree will mutate the input data you pass. If you want to preserve the input data, it's recommended to clone it. For example `const copiedInput = JSON.parse(JSON.stringify(input))'`.

### Array Example

```json
[
  {
    "_name": "Elizabeth II",
    "Title": "Queen",
    "_shortTitle": "Queen"
  }
]
```

### Object Example

```json
{
  "Elizabeth II": {
    "_name": "Elizabeth II",
    "Title": "Queen",
    "_shortTitle": "Queen"
  }
}
```

### Entity Object Format

Note that this format is strict. Invalid data will cause the library to throw errors.

#### Fields

| Field   | Type             | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_name` | String           | Yes      | This field acts as the id of the entity. This value is also the text of a node on the tree unless a `modifyEntityName` option is passed in. Note that the `_name` key cannot be an empty string.                                                                                                                                                                                                                                     |
| `_deps` | Array of Strings | No       | This array of strings represents a list of entities this entity depends on. All elements must be of type String. Each element represents the `_name` of another entity in the graph. If a dependency is listed in this array but not included in the list of entities, an entity will be created. If this field is excluded, the library assumes there are no dependencies. Note that elements in `_deps` cannot be an empty string. |

#### Additional Fields

Additional fields can be added to each entity data object. These fields will be displayed in the tooltip when users hover over a node. Any fields that are prefixed with an underscore (e.g. `_shortTitle`) will not be displayed, but will be included in the entity object. This can be useful when filtering entities with `getEntityList` and programming actions with `textClick` for example.

Example of an entity with some additional fields.

```json
[
  {
    "_name": "Elizabeth II",
    "Title": "Queen",
    "_shortTitle": "Queen"
  }
]
```

#### Added Fields

DependenTree will add a few properties to nodes when it creates the tree. They are listed here. You should not create [Additional Fields](#additional-fields) in your entity data that have these same property keys. These fields can sometimes be useful in methods such as `modifyEntityName` and `textClick` for example.

| Property         | Description.                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `_isClone`       | Entities that have been cloned to prevent infintie loops and graph depth performance issues.                 |
| `_maxDepth`      | Entities that are at maxDepth. These entities will have additional children, but they will not be displayed. |
| `_cyclic`        | Entities that have cyclic dependencies.                                                                      |
| `_missing`       | Entities that were not included in the input data but added when constructing the graph.                     |
| `__visited`      | A field that is used to detect cycles in the input data. This field is deleted shortly after it is created.  |
| `Automated Note` | A note giving more information about the error associated with the entity.                                   |

## Understanding Max Depth

For large graphs, this library imposes a limit to how many entities can be displayed. Graphs are passed to [d3.tree](https://github.com/d3/d3-hierarchy#tree) to determine node coordinates. This method traverses the entire graph which is an operation that has a time complexity of O(n²). For large entity graphs, this can result in the browser tab crashing.

To prevent this, the `maxDepth` option caps the depth of a graph. With smaller graphs, it's best to set this variable high. With larger graphs, it's probably better to set this value lower. There is not an exact right answer however. See the example graph below.

### Hypothetical Example

```
        c --- d --- e --- f --- b --- y --- x
      /
a ---
      \
        b --- x --- y
```

Let's set the `maxDepth` to 6. In the example above, the higher branch would cut off at node `b`. But because entity `b` on the higher branch node is the same as entity `b` on the lower branch node, the lower branch will cut off as well and we won't see the `x` and `y` entities either. For this reason, it can be difficult to settle on a perfect value. The higher the `maxDepth`, the more entities that will be cut off at that depth. The more entities cut off overall, the more likely that those entities will also be cut off at lower depths where the user will see.

### Real Example

`maxDepth` works by traversing the graph with a initial depth first search algorithm and cutting off the graph once the max depth is reached. When visualizing our 14K+ ETL tables at Block, one of our key tables has 141 direct downstream dependencies. The full downstream tree without `maxDepth` would be exceptionally large. Below are results of different tests of `maxDepth` on this tree. Seconds to Map Tree refers to the time for the depth first search algorithm to run. Note that this test was run on Chrome on a high powered device.

| Max Depth | Seconds to Map Tree |
| --------- | ------------------- |
| 42        | `51.879`            |
| 40        | `11.984`            |
| 35        | `3.405`             |
| 30        | `0.651`             |
| 27        | `1.982`             |
| 26        | `0.768`             |
| 25        | `26.753`            |
| 24        | `3.005`             |
| 23        | `0.274`             |
| 20        | `0.222`             |

The unusual pattern above with a value of 25 taking a significantly longer time than others is an indicator of the highly unpredictable nature of `maxDepth`. At first glance, it might seem like 30 or 35 is the best value for `maxDepth` as this strikes a balance between a lower time to map the tree and a deeper level of dependencies before the tree is cut off. However, 35 is the number that works best for this particular tree. When exploring a tree based on a different table in the same graph, a `maxDepth` of 35 yields a very poor result of 20 seconds to map and load.

For this reason, the `maxDepth` we have decided on for our graph of 14K ETLs is 20. It's unlikely users will want to dig deeper than 20 levels of dependencies and this will lead to fewer nodes overall from getting cut off. Performance is fast enough but we show a loading animation while calling `.setTree` just in case any entity's tree takes a long time to load.

### Another Hypothetical

With the table above, it's likely that the reason performance worsened so much at a depth of 25 is because at the other levels, there was enough overlap in nodes we were visiting and cutting off sooner. 25 was just the unlucky number where we had enough unique nodes at the level and not enough was cut off. See the example below.

```
1           2     3     4     5
         -- m --- r --- a --- o ---
       /
z --------- r --- a --- o --- p --- 
       \
         -- p --- j --- q --- n
```

- If we set `maxDepth` at 3, the top branch will cut off at `r`. This leads to the middle branch being cut off at `r` in level 2.
- If we set `maxDepth` at 5, the top branch will cut off at `o`. This leads to the middle branch begin cut off at `o` in level 4.
- If we set `maxDepth` at 4, only the middle branch will be cut off slightly early with `a` at level 3. Though `o` connects to `p` in the middle branch, the connection between `z` and `p` is still intact and we will traverse the bottom branch until we hit `q`. Less compute time and fewer resources were saved at this level.

In conclusion: for large graphs, it's best to pick a small number and experiment until you find the right one.


## Examples

### `modifyEntityName`

The example below would take an entity with a `_name` in the format of `"databasename.schemaname.tablename"` and return just `"tablename"` to be displayed without modifying the `_name` property itself.

```javascript
const modifyEntityName = nodeData => {
  const { _name } = nodeData;
  const i = _name.lastIndexOf('.');
  return _name.slice(i + 1);
};
```

### `textClick`

```javascript
const textClick = (event, nodeData) => {
  const _link = nodeData._link;
  if (!_link) return;
  window.open(_link, '_blank');
};
```

### Form Example

[See this example live](https://observablehq.com/@amogh/dependentree#cell-651)

```html
<html>
  <head>
    <style>
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      body,
      html {
        height: 100vh;
        width: 100%;
      }

      form {
        width: 100vh;
        height: 200px;
      }

      div {
        width: 100%;
        height: 900px;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <form>
      <select id="filter">
        <option value="">All</option>
        <option value="Prince">Prince</option>
        <option value="Princess">Princess</option>
      </select>
      <select id="list"></select>
      <select id="direction">
        <option value="downstream">downstream</option>
        <option value="upstream">upstream</option>
      </select>
    </form>
    <button id="form-expand">Expand All</button>
    <button id="form-collapse">Collapse All</button>
    <div id="form-tree"></div>
  </body>
  <script type="text/javascript" src="dependentree.js"></script>
  <!-- For this example, the JSON array is parsed and saved as a JavaScript variable called royals -->
  <script type="text/javascript" src="royals.js"></script>
  <script>
    const t = new DependenTree('div#form-tree');

    // Adds data
    t.addEntities(clone(testData.royals));
    
    // Gets a list of all entities
    const entityList = t.getEntityList()

    // Getting each select dropdown
    const entitySelect = document.getElementById('list');
    const directionSelect = document.getElementById('direction');
    const filterSelect = document.getElementById('filter');

    // function to add options to our entitySelect
    // We need to do this every time the user picks
    // a new entity filter
    const populateEntitySelect = entityList => {
      entityList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        const text = document.createTextNode(name);
        option.appendChild(text);
        entitySelect.appendChild(option);
      });
    }

    // populate the initial list of entities
    const allEntities = t.getEntityList();
    populateEntitySelect(allEntities);

    // set default values for the tree
    let currentEntity = 'Elizabeth II';
    let direction = 'downstream';

    // This function filters the list of entities by attributes
    // In this case, some entities have a "_shortTitle" attribute.
    // We can filter by Prince or Princess.
    filterSelect.addEventListener('change', e => {
      // clear any existing options in the select
      entitySelect.innerHTML = '';

      const value = e.target.value;
      let filteredList;
      if (value === '') {
        filteredList = t.getEntityList();
      } else {
        filteredList = t.getEntityList('_shortTitle', value);
      }

      populateEntitySelect(filteredList);

      // The selected entity usually changes when we change
      // the dropdown. The expected behavior from users
      // is to have the tree change. This code triggers that.
      setTimeout(() => {
        t.setTree(entitySelect.value, direction);
      }, 100);
    });
    
    // the two event listeners below change which tree is displayed
    // depending on entity name and upstream or downstream
    entitySelect.addEventListener('change', e => {
      if (e.target.value === '') return;
      currentEntity = e.target.value;
      t.setTree(currentEntity, direction);
    });

    directionSelect.addEventListener('change', e => {
      direction = e.target.value;
      t.setTree(currentEntity, direction);
    });

    // expand and collapse all buttons
    document.querySelector('button#form-expand').addEventListener('click', () => t.expandAll());
    document.querySelector('button#form-collapse').addEventListener('click', () => t.collapseAll());

    // set default values for the tree
    // and the default tree
    let currentEntity = 'Elizabeth II';
    let direction = 'downstream';
    t.setTree(currentEntity, direction);
  </script>
</html>
```
## Resources

- [Live Playground](https://observablehq.com/@amogh/dependentree)
<!-- - [npm]() -->
<!-- - [Blog]() -->


---

Copyright 2022 Square Inc.
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
