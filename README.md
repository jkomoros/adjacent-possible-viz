# adjacent-possible-viz
Simple visualization library for creating schematic adjacent possible visualizations.

Still in a kind of messy state. If you use it, reach out to alex@komoroske.com and I'll invest in cleaning it up! Alternatively, file a new issue with a feature suggestion or question!

![Animated Example](/examples/accumulate.gif?raw=true)

# Installing

Install npm.

Check out this repo.

Run `npm install` to install dependencies.

### Installing on Apple Silicon

The machinery to do screenshotting relies on a library that doesn't install cleanly on Apple Silicon.

Can get everything but screenshots running with `npm install --only=prod`

Install homebrew if not already installed

Run `arch -arm64 brew install pkg-config cairo pango libpng jpeg giflib librsvg`

Then run `npm install canvas` and `npm install`

# Running

If you want to do your own frames, create a `frame_data.json` in the root of the repo. If not provided, `frame_data.SAMPLE.json` will be used.

Run `polymer serve` from command line.

Visit http://localhost:8081

Arrow keys left or right to move forward or backward in state.

Run `npm run generate` to generate screenshots, one for each state in your `frame_data.json`, blowing away whatever was in the screenshots/ directory.

If you only want to generate the screenshots, not the gifs, run `npm run generate:screenshot`. If you only want to generate the gifs based on already-generated screenshots, run `npm run generate:gif`.

# JSON format

The JSON file is an array of frames that build on each other, shadowing and overriding what was set in earlier frames.

Each frame is an object with commands that apply:

- `setSize`: `[rows, cols]` - Must be in the first state, and may be in later ones. Resets the map to that size.
- `setAdjacentPossibleSteps`: `<positive integer>` - Override how many steps of adjacent possible around captured cells to show. 0 disables adjacent possible highlighting. Defaults to 3.
- `setScale`: `<positive float>` - Override the scale of the rendered output. 1.0 is default scale.
- `setColors`: `<object>` - Set colors of the given names to the given values. See `colorsParameters` for information on the meaning of each color name. See `colorDefinition` for legal value of the keys of the object. Colors that are not named will not be modified from the state before. Setting a color to `null` will set the color back to the default value.
- `description`: `<string>` - A string describing what that frame. The description doesn't do anything, it's more to help orient you in your frame description.
- `name`: `<string` - A name for the state, to refer to later with resetTo.
- `resetTo`: `<string>` - Resets the state to the state at the named previous state. The named state must exist, and must be BEFORE this one.
- `repeat`: `<integer>` - If set, will repeat this block in place that many times to save you from having to type it a lot. Useful for lots of grow blocks.
- `disable`: `true` - If true, then it will be as though that frame wasn't in the JSON at all. Useful for temporarily disabling a frame when debugging your definitions.
- `gif`: `<object> or <string> or true` - If set, this frame will be marked to be rolled up into the gif. Each unique string will denote a different named gif. true defaults to 'default'. If an object, it should have the shape of gifParameters below. Only one gifParameters per gif needs to be set; the rest can just use a string of the same name. All frames for a given gif must be the same size (scale and setSize) or the gif won't be saved. Frames tagged to be included in a gif will not have a transparent background (otherwise the variable alpha looks weird).
- `grow`: `<non-falsey-value>` - Grows all of the active cells into a legal neighbor. See growParameters below for more values that can be passed in an object.
- `generate`: `<non-falsey-value>` - Generates a new map of values in the map. See generateParameters below for more values that can be passed in an object.
- `move`: `true` - Adds velocityX/velocityY to each cell's offsetX and offsetY.
- `randomize` : `<object> or <object>[]` Randomizes the given property for the given cells. See RandomizeParameters, below. You can provide one config or an array. Some properties, like opacity and velocity, actually set multiple properties underneath (e.g. [strokeOpacity, fillOpacity] or [velocityX, velocityY]). In some cases you want the random values to be hte same (e.g. opacity) and in some cases you want it to be different (e.g. velocity). The library does the most reasonable thing in each case.

The next groups are cell commands. They select a property to modify, a value to set, and then a range of cells to affect, like this:
`<property-name> : [[<value>, <cell-reference>], [<value2>, <cell-reference2>], ...]`. You can have a single value/cell-reference pair or as many as you want.

Cell-reference can be any of:
- a `[row, col]` tuple to select a single cell
- a `[startRow, startCol, endRow, endCol]` tuple to define a rectangle, where the start and end are inclusive
- a `[]` empty tuple to select all cells in the map.

The cell properties that can be set are:
- `value` [-1.0 ... 1.0] or null: The value for the cell. 1.0 renders green, -1.0 renders red, and 0.0 renders white, with smooth gradations. A value of null will render a gray.
- `highlighted` (boolean): cells that are highlighted have an outline, and by default full opacity.
- `captured` (boolean): cells that are captured have a different colored outline, are full opacity, and also have adjacent possible partial opacity emanating from them.
- `active` (boolean): cells that are 'active' and will be expanded via the 'grow' command. Automatically sets captured to true to if not already set.
- `activeOnly` (boolean): If you want to set a cell to active without also capturing it.
- `opacity` [0.0 ... 1.0] - Overrides the default opacity for a cell. Equivalent to setting fillOpacity and strokeOpacity at the same time.
- `fillOpacity` [0.0 ... 1.0] - Overrides the default opacity for a cell, affecting only the fill color.
- `strokeOpacity` [0.0 ... 1.0] - Overides the default opacity for a cell, affecting only the stroke color. 
- `scale` [0.0 ... 10.0] - Scale of individual cells (as opposed to all cells, like setScale)
- `offsetX` - Offsets the cell that many pixels in the x direction from its normal position
- `offsetY` - Offsets the cell that many pixels in the y direction from its normal position
- `nudge` - Takes an [x, y] pair and nudges the offsetX and offsetY of the affected cells by that amount.
- `velocity` - Sets both velocityX and velocityY at the same time to the same value.
- `velocityX` - Sets the rate that this cell will move in the x direction per call to `move`
- `velocityY` - Sets the rate that this cell will move in the y direction per call to `move`

There is also one special cell command, `reset`. It doesn't require a property
value, so it just takes an array of cellReferences. It resets each affected cell
to its default values.

You can check out `frame_data.SAMPLE.json` and the tests in test/data for examples of nearly all of these commands in use.

**colorDefinition**:
Color defintions in the `setColors` command block can be:
- A string like '#FFCC00', or '#FC0' or '#FFCC00FF' or '#FC0F'
- A string like 'rgb(255, 106, 0)' or 'rgba(255, 106, 0, 1.0)'
- A css named string like `aliceblue` or `transparent`
- A tuple of [r, g, b] or [r, g, b, a] values

**colorParameters**:
- `zero` - The color for cells with a value 0.0
- `positive` - The color for cells with a value of 1.0
- `negative` - The color for cells with a value of 0.0
- `empty` - The color for cells that are set to null
- `captured` - The color for the stroke for captured cells
- `highlighted` - The color for the stroke for highlighted cells
- `background` - The color of the background of the diagram. The background will not be in png screenshots by default (it will be transparent), but for GIF frames the background will be included (since GIFs don't handle variable transparency).

**gifParameters**:
- `name` - `string` If providing an object, name is required. This will be the name of the gif output, and also how other frames can denote they are part of the same gif by providing `gif: <string>`.
- `repeat` - `<integer>` Defaults to 0. How many repeats to have in the gif. -1 is no repeat, 0 is infinite, and any other positive integer is repeat count.
- `delay` - `<integer>` Defaults to 150. How many ms to wait between frames in the gif.

**randomizeParameters**
- `name` - The property name to randomize. For boolean values, values will be clipped to 0.0 and 1.0 and then rounded to the final value for true or false. For numbers, it will be a linear range between min and max.
- `seed` - `true or string` - Optional. Can set a specific seed for this randomization.
- `min` - `number` - Optional. If omitted, defaults to 0.0. The lowest number for the values.
- `max` - `number` - Optional. If omitted, defaults to 1.0. The highest number for the values.
- `relative` - `boolean` - Optional. If true, then instead of resetting the value with the new value, it will add the random value to the existing value.
- `cells` - `CellReference` - Optional. The cells to randomize the property for. If omitted, will modify the whole map.

**growParameters**:
- `seed`: `string` - A string to use as seed. The results are deterministic. If you don't like the result you're getting at a step, provide a different seed. If the boolean true is provided, it will operate non deterministically, effectively using a fresh seed every time.
- `randomness`: `[0.0 ... 1.0]` - A value for how random the neighbor pick should be. 1.0 is totally random pick of any nearby legal neighbor. 0.0 is deterministic of best valued thing
- `proportion`: `[0.0 ... 1.0]` - What percentage of active cells should be grown in a given step. 1.0 is all cells, 0.0 is none. This is the relative version of numCellsToGrow
- `numCellsToGrow`: `[integer]` - The highest number of cells to grow in a step, an absolute number. If more than 0, then this will put in place a cap. See also proportion, which is a proportion of active cells.
- `valuePly` `[integer]` - How many concentric rings away from a cell to consider when looking at which neighbor to grow into. Defaults to 8.
- `valueDropoff` `[0.0 - 1.0]` - How much of the value of neighbors to discount when adding to a cell's own value. Larger numbers put more emphasis on the cell itself, not its neighbors. Defaults to 0.75.
- `branchLikelihood` `[0.0 -1.0]` - How likely a given active cell when growing is to branch--to both grow and leave the old one active, too. Defaults to 0.0.

**generateParameters**:
- `seed`: `string` - A string to use as seed. The results are deterministic. If you don't like the result you're getting, provide a different seed. If the boolean true is provided, it will operate non deterministically, effectively using a fresh seed every time.
- `keyCellProportion`: `[0.0 - 1.0]` A float of what percentage of all cells in the map should be explicitly set. Smaller numbers produce larger contiguous regions of color. Defaults to 0.6.
- `proportions`: `<map of key to value>` A map of value to proportion, to override how often a given value shows up in generation. Values that are not provided will use their default. The key is things like `1.0`, `0.0`. The value should be between 0 and 100 saying how common it is. Special keys are 'max', 'min', 'zero', 'null', 'negative', and 'positive', which will be used for those special values if specific numeric keys that are more specific aren't provided. The default values are:
```
 {
	max: 100,
	min: 15,
	positive: 100,
	negative: 5,
	zero: 25,
	null: 15
};
```

## More Examples

![Static transparent](/examples/screenshot_13.png?raw=true)
![Converging example](/examples/converge.gif?raw=true)
![Slime animated](/examples/slime.gif?raw=true)