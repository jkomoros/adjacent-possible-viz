
import {
	prng_alea
} from 'esm-seedrandom';

import {
	color
} from './color.js';

import {
	CellData,
	CellPropertyName,
	CellReference,
	Colors,
	ConfigData,
	ConfigDataItem,
	ConfigDataItemSetCell,
	ConfigDataItemSetCellDirect,
	ConfigDataItemSetCellMulti,
	ConfigDataItemSetCellRandomizable,
	ExpandedCellReference,
	ExpandedColor,
	ExpandedFrameData,
	GenerateConfiguration,
	GrowConfiguration,
	Proportions,
	RandomGenerator,
	RandomizeConfigurationItem,
	Size
} from './types.js';

import {
	TypedObject
} from './typed-object.js';

/*
expandedMapData has the following shape:
{
	rows: 5,
	cols: 5,
	adjacentPossibleSteps: 1,
	scale: 1.0,
	colors {
		'zero': color(),
		'negative': color(),
		'positive': color(),
	}
	cells: [//cellData]
}

where cell data looks like:

{
	row: 0,
	col: 1,
	value: 0.0,
	highlighted: true,
	captured: true,
	scale: 1.0,
	//Manually set opacity. If not undefined, will be used, otherwise autoOpacity will be used.
	fillOpacity: 0.5,
	strokeOpacity: 0.5,
	autoOpacity: 1.0,
}

*/

const DEFAULT_ADJACENT_POSSIBLE_STEPS = 3;

export const ZERO_COLOR_NAME = 'zero';
export const POSITIVE_COLOR_NAME = 'positive';
export const NEGATIVE_COLOR_NAME = 'negative';
export const EMPTY_COLOR_NAME = 'empty';
export const BACKGROUND_COLOR_NAME = 'background';
export const HIGHLIGHTED_COLOR_NAME = 'highlighted';
export const CAPTURED_COLOR_NAME = 'captured';

export const DEFAULT_COLORS : Colors<ExpandedColor>= {
	[ZERO_COLOR_NAME]: color('#FFF'),
	[POSITIVE_COLOR_NAME]: color('#38761D'),
	[NEGATIVE_COLOR_NAME]: color('#C00'),
	[EMPTY_COLOR_NAME]: color('#666'),
	[BACKGROUND_COLOR_NAME]: color('#356F9E'),
	[HIGHLIGHTED_COLOR_NAME]: color('white'),
	[CAPTURED_COLOR_NAME]: color('black')
};

export const EMPTY_EXPANDED_FRAME_DATA = {
	rows:0,
	cols:0,
	adjacentPossibleSteps: 0,
	scale: 1.0,
	cells: [],
	colors: {...DEFAULT_COLORS}
};

/*
	cellValueCommands are arrays, where each element is of the shape [valueToSet, CellReference]

	where cellReference is one of:
	* [row, col] for a single cell
	* [startRow, startCol, endRow, endCol] to select a rectangle (INCLUSIVE)
	* [] to select all cells
*/

//Expects an array of [rows, cols] for size of map.
export const SET_SIZE_COMMAND = "setSize";
//Expects an array of [rows, cols] for size of map.
export const SET_ADJACENT_POSSIBLE_STEPS_COMMAND = "setAdjacentPossibleSteps";
//0.0 ... 10.0
export const SET_SCALE_COMMAND = "setScale";
export const SET_COLORS_COMMAND = "setColors";
export const RESET_CELLS_COMMAND = "reset";
//Expects a cellValueCommand (see above)
export const SET_HIGHLIGHTED_COMMAND = "highlighted";
//Expects a cellValueCommand (see above)
export const SET_CAPTURED_COMMAND = "captured";
//Expects a cellValueCommand (see above)
export const SET_ACTIVE_COMMAND = "active";
//Expects a cellValueCommand.
export const SET_ACTIVE_ONLY_COMMAND = "activeOnly";
//Expects a cellValueCommand (see above)
export const SET_VALUE_COMMAND = "value";
//Expects a cellValueCommand (see above). This is semantically equivalent to setting fillOpacity and strokeOpacity at the same time.
export const SET_OPACITY_COMMAND = "opacity";
export const SET_FILL_OPACITY_COMMAND = "fillOpacity";
export const SET_STROKE_OPACITY_COMMAND = "strokeOpacity";
//Scale of individual cell, in place. 0.0 ... 10.0
export const SET_CELL_SCALE_COMMAND = "scale";
export const SET_OFFSET_X_COMMAND = 'offsetX';
export const SET_OFFSET_Y_COMMAND = 'offsetY';
export const SET_VELOCITY_X_COMMAND = 'velocityX';
export const SET_VELOCITY_Y_COMMAND = 'velocityY';
export const SET_VELOCITY_COMMAND = 'velocity';
export const NUDGE_COMMAND = 'nudge';
//Expects a name that was a PREVIOUS state, with a 'name' property, and uses
//that, instead of the previous state, to base its modifications off of.
export const RESET_TO_COMMAND = 'resetTo';
//The name to set for reset_to to refer to
export const NAME_COMMAND = 'name';
//Grow by one step. Any non-falsely value is fine.
export const GROW_COMMAND = 'grow';
//Grow by one step. Any non-falsely value is fine.
export const GENERATE_COMMAND = 'generate';
//A number of how many times to repeat this block in place.
export const REPEAT_COMMAND = 'repeat';
export const MOVE_COMMAND = 'move';
//A string or "" to request gif output include this frame. Only frames that explicitly include this will be outputed.
//Duplicated in screenshot.js
export const GIF_COMMAND = 'gif';
export const DISABLE_COMMAND = 'disable';

const SET_CELL_COMMANDS : Record<keyof ConfigDataItemSetCell, (keyof ConfigDataItemSetCellDirect)[]> = {
	[SET_HIGHLIGHTED_COMMAND]: [SET_HIGHLIGHTED_COMMAND],
	[SET_CAPTURED_COMMAND]: [SET_CAPTURED_COMMAND],
	[SET_ACTIVE_ONLY_COMMAND]: [SET_ACTIVE_COMMAND],
	[SET_ACTIVE_COMMAND]: [SET_ACTIVE_COMMAND, SET_CAPTURED_COMMAND],
	[SET_VALUE_COMMAND]: [SET_VALUE_COMMAND],
	[SET_OPACITY_COMMAND]: [SET_FILL_OPACITY_COMMAND, SET_STROKE_OPACITY_COMMAND],
	[SET_FILL_OPACITY_COMMAND]: [SET_FILL_OPACITY_COMMAND],
	[SET_STROKE_OPACITY_COMMAND]: [SET_STROKE_OPACITY_COMMAND],
	[SET_CELL_SCALE_COMMAND]: [SET_CELL_SCALE_COMMAND],
	[SET_OFFSET_X_COMMAND]: [SET_OFFSET_X_COMMAND],
	[SET_OFFSET_Y_COMMAND]: [SET_OFFSET_Y_COMMAND],
	[SET_VELOCITY_X_COMMAND]: [SET_VELOCITY_X_COMMAND],
	[SET_VELOCITY_Y_COMMAND]: [SET_VELOCITY_Y_COMMAND],
	[SET_VELOCITY_COMMAND]: [SET_VELOCITY_X_COMMAND, SET_VELOCITY_Y_COMMAND]
};

const SET_CELL_RANDOM_BEHAVIOR : Record<keyof ConfigDataItemSetCellRandomizable, 'consistent' | 'independent' | 'single'> = {
	opacity: 'consistent',
	velocity: 'independent',
	highlighted: 'single',
	captured: 'single',
	active: 'single',
	scale: 'single',
	offsetX: 'single',
	offsetY: 'single',
	velocityX: 'single',
	velocityY: 'single',
	strokeOpacity: 'single',
	fillOpacity: 'single',
	value: 'single'
};

const setDefaultsOnCell = (cell : Partial<CellData>) => {
	cell.value = 0.0;
	cell.highlighted = false;
	cell.captured = false;
	cell.active = false;
	cell.scale = 1.0;
	//undefined says it should use autoOpacity instead
	cell.fillOpacity = undefined;
	cell.strokeOpacity = undefined;
	cell.autoOpacity = 0.0;
	cell.offsetX = 0.0;
	cell.offsetY = 0.0;
	cell.velocityX = 0.0;
	cell.velocityY = 0.0;
};

const defaultCellData = (row : number, col: number) : CellData => {
	const cell = {
		row,
		col
	};
	setDefaultsOnCell(cell);
	return cell as CellData;
};

export const defaultCellsForSize = (rows : number, cols : number) : CellData[] => {
	const result = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			result.push(defaultCellData(r, c));
		}
	}
	return result;
};

export const defaultExpandedFrameForCells = (cells : CellData[]) : ExpandedFrameData => {
	let rows = 0;
	let cols = 0;
	if (cells.length) {
		rows = cells.map(cell => cell.row).reduce((prev, curr) => curr > prev ? curr : prev) + 1;
		cols = cells.map(cell => cell.col).reduce((prev, curr) => curr > prev ? curr : prev) + 1;
	}
	return {
		rows,
		cols,
		adjacentPossibleSteps: DEFAULT_ADJACENT_POSSIBLE_STEPS,
		colors: {...DEFAULT_COLORS},
		scale: 1.0,
		cells
	};
};

export const getCellFromMap = (map : ExpandedFrameData, row : number, col : number) : CellData | null => {
	if (row < 0 || row >= map.rows) return null;
	if (col < 0 || col >= map.cols) return null;
	return map.cells[row * map.cols + col];
};

const expandCellReference = (map : ExpandedFrameData, cellReferences : CellReference) : ExpandedCellReference => {
	//Convert a reference of length 0 to the whole map
	if (cellReferences.length == 0) return [0,0,map.rows -1, map.cols -1];
	//convert a single reference to a rectangualr of size one
	if (cellReferences.length == 2) return [cellReferences[0], cellReferences[1], cellReferences[0], cellReferences[1]];
	return cellReferences;
};

const cellsFromReferences = (map : ExpandedFrameData, inCellReferences : CellReference) : CellData[] => {
	const cellReferences = expandCellReference(map, inCellReferences);
	if (cellReferences.length != 4) throw new Error("Unknown cell reference shape: " + cellReferences);
	const result : CellData[] = [];
	const [startRow, startCol, endRow, endCol] = cellReferences;
	if (startRow < 0 || startRow >= map.rows) throw new Error('Invalid cell reference: row ' + startRow + ' is out of bounds');
	if (endRow < 0 || endRow >= map.rows) throw new Error('Invalid cell reference: row ' + endRow + ' is out of bounds');
	if (startCol < 0 || startCol >= map.cols) throw new Error('Invalid cell reference: col ' + startCol + ' is out of bounds');
	if (endCol < 0 || endCol >= map.cols) throw new Error('Invalid cell reference: col ' + endCol + ' is out of bounds');
	if (endRow < startRow) throw new Error("Cell reference invalid: endRow must be larger: " + cellReferences);
	if (endCol < startCol) throw new Error("Cell reference invalid: endCol must be larger: " + cellReferences);
	for (let r = startRow; r <= endRow; r++) {
		for (let c = startCol; c <= endCol; c++) {
			const cell = getCellFromMap(map, r, c);
			if (!cell) throw new Error('Invalid cell');
			result.push(cell);
		}
	}
	return result;
};

//Returns a new reference that is like reference, but legal and within bounds of map
const trimCellReferenceToMap = (map : ExpandedFrameData, inReference : CellReference) : ExpandedCellReference => {
	const reference = [...expandCellReference(map, inReference)];
	if (reference[0] < 0) reference[0] = 0;
	if (reference[1] < 0) reference[1] = 0;
	if (reference[2] >= map.rows) reference[2] = map.rows - 1;
	if (reference[3] >= map.cols) reference[3] = map.cols - 1;
	if (reference.length != 4) throw new Error('Invalid expanded reference');
	return reference as [number, number, number, number];
};

const resetCellsOnMap = (map : ExpandedFrameData, cellReference : CellReference) : void => {
	const cells = cellsFromReferences(map, cellReference);
	for (const cell of cells) {
		setDefaultsOnCell(cell);
	}
};

const setPropertiesOnMap = (map : ExpandedFrameData, propertyName : keyof ConfigDataItemSetCellDirect, valueToSet : unknown, cellReferences : CellReference) => {
	const cells = cellsFromReferences(map, cellReferences);
	for (const cell of cells) {
		(cell as any)[propertyName] = valueToSet;
	}
};

//The highest opacity for an adjacent possible cell. It's actually smaller than
//this; this steps down the whole transparency by a bit.
const MAX_ADJACENT_POSSIBLE_OPACITY = 0.75;

const setAutoOpacity = (map : ExpandedFrameData) => {
	for (const cell of map.cells) {
		cell.autoOpacity = 0.0;
	}
	//bump it up so that 0.0 opacity is just past the end of the last highlighted step
	const farthestDistance = Math.sqrt(Math.pow(map.adjacentPossibleSteps + 1, 2) + Math.pow(map.adjacentPossibleSteps + 1, 2));
	for (const cell of map.cells) {
		if (!cell.highlighted && !cell.captured && !cell.active) continue;
		cell.autoOpacity = 1.0;
		if (!cell.captured) continue;
		let cellReference = trimCellReferenceToMap(map, [cell.row - map.adjacentPossibleSteps, cell.col - map.adjacentPossibleSteps, cell.row + map.adjacentPossibleSteps, cell.col + map.adjacentPossibleSteps]);
		const cells = cellsFromReferences(map, cellReference);
		for (const innerCell of cells) {
			//Skip ourselves
			if (innerCell == cell) continue;
			const distance = Math.sqrt(Math.pow(innerCell.row - cell.row, 2) + Math.pow(innerCell.col - cell.col, 2));
			const opacityToSet = MAX_ADJACENT_POSSIBLE_OPACITY - (distance / farthestDistance);
			//It could be a cell that is captured or closer to another cell.
			if (innerCell.autoOpacity > opacityToSet) continue;
			innerCell.autoOpacity = opacityToSet;
		}
	}
};

const nudgeMap = (map : ExpandedFrameData, cellReferences: CellReference, offset : Size) => {
	const cells = cellsFromReferences(map, cellReferences);
	for (const cell of cells) {
		cell.offsetX += offset[0];
		cell.offsetY += offset[1];
	}
}

const moveMap = (map : ExpandedFrameData) => {
	for (const cell of map.cells) {
		cell.offsetX = cell.offsetX + cell.velocityX;
		cell.offsetY = cell.offsetY + cell.velocityY;
	}
}

const assertUnreachable = (x : never) : never => {
	throw new Error('Exhaustiveness check failed: ' + String(x));
};

const randomizeMap = (map : ExpandedFrameData, config : RandomizeConfigurationItem) => {
	const seed = config.seed === true ? undefined : config.seed;
	const rnd = prng_alea(seed);
	const min = config.min || 0.0;
	const max = config.max || 1.0;
	const ref = config.cells || [];
	const multiMode = SET_CELL_RANDOM_BEHAVIOR[config.name];
	const cells = cellsFromReferences(map, ref);
	//each group in nameGroups will get randomized to the same value. So if
	//there are multiple names in one group, they'll get the same random value
	//applied.
	const nameGroups : (keyof ConfigDataItemSetCellDirect)[][] = [];
	const commands = SET_CELL_COMMANDS[config.name];
	switch (multiMode) {
		case 'consistent':
		case 'single':
			nameGroups.push(commands);
			break;
		case 'independent':
			for (const command of commands) {
				nameGroups.push([command]);
			}
			break;
		default:
			assertUnreachable(multiMode);
	}
	for (const cell of cells) {
		for (const nameGroup of nameGroups) {
			for (const name of nameGroup) {
				const val = (max - min) * rnd.quick() + min;
				const isBool = typeof cell[name] == 'boolean';
				let original = config.relative ? cell[name] : 0;
				if (original === undefined) throw new Error('Uninitalized value');
				if (original === null) original = 0.0;
				if (typeof original == 'boolean') original = original ? 1.0 : 0.0;
				let newVal = val + original;
				if (isBool) {
					if (newVal > 1.0) newVal = 1.0;
					if (newVal < 0.0) newVal = 0.0;
					newVal = Math.round(newVal);
					(cell as any)[name] = newVal == 0.0 ? false : true;
				} else {
					(cell as any)[name] = newVal;
				}
			}
		}
	}

}

const defaultGrowConfig = () : GrowConfiguration => {
	return {
		seed: 'seed',
		randomness: 0.1,
		proportion: 1.0,
		//0 is inactive
		numCellsToGrow: 0,
		//How many rings outward to look at for value
		valuePly: 8,
		//How much of the value from neighbors shoud flow inwards
		valueDropoff: 0.75,
		branchLikelihood: 0.0,
	};
};

const opacityForCell = (cell : CellData) : number => {
	return cell.fillOpacity === undefined || cell.fillOpacity === null ? cell.autoOpacity : cell.fillOpacity;
};

const localValueForCell = (cell : CellData) : number => {
	if (typeof cell.value != 'number') return 0.0;
	return opacityForCell(cell) * cell.value;
};

//Returns a list of the cells that ring the centerCell. 0 plys is the center
//cell itself, 1 is immediate neighbors, 2 is the ring outside of that, etc.
export const ringCells = (map : ExpandedFrameData, centerCell : CellData, ply : number) : CellData[] => {
	if (ply == 0) return [centerCell];
	const result : CellData[] = [];
	//Top row
	let r = centerCell.row - ply;
	for (let c = centerCell.col - ply; c <= centerCell.col + ply; c++) {
		const neighbor = getCellFromMap(map, r, c);
		if (neighbor) result.push(neighbor);
	}
	//Right side
	let c = centerCell.col + ply;
	for (let r = centerCell.row - ply + 1; r <= centerCell.row + ply - 1; r++) {
		const neighbor = getCellFromMap(map, r, c);
		if (neighbor) result.push(neighbor);
	}
	//Bottom row
	r = centerCell.row + ply;
	for (let c = centerCell.col + ply; c >= centerCell.col - ply; c--) {
		const neighbor = getCellFromMap(map, r, c);
		if (neighbor) result.push(neighbor);
	}
	//left side
	c = centerCell.col - ply;
	for (let r = centerCell.row + ply -1; r > centerCell.row - ply; r--) {
		const neighbor = getCellFromMap(map, r, c);
		if (neighbor) result.push(neighbor);
	}
	return result;
};

//returns the number of ply outward from the centerCell this cell is. That is,
//if you called ringCells(centerCell), what value of ply would have this cell in it?
export const ringPly = (cell : CellData, centerCell : CellData) => {
	const rowDiff = Math.abs(cell.row - centerCell.row);
	const colDiff = Math.abs(cell.col - centerCell.col);
	return Math.max(rowDiff, colDiff);
};

//Returns the neighbors of the given cell that are in the ring immediately outward of itself from the center cell.
export const outerNeighbors = (map : ExpandedFrameData, cell : CellData, centerCell : CellData) => {
	const ourPly = ringPly(cell, centerCell);
	return ringCells(map, cell,1).filter(neighbor => ringPly(neighbor, centerCell) > ourPly);
};

const netPresentValueMap = (map : ExpandedFrameData, centerCell : CellData, growConfig : GrowConfiguration) => {
	const result = new Map();
	const maxPly = growConfig.valuePly || 0;
	for (let ply = maxPly; ply > 0; ply--) {
		const ring = ringCells(map, centerCell, ply);
		for (const cell of ring) {
			let cellValue = localValueForCell(cell);
			let isWall = typeof cell.value != 'number';
			//Treat negative values as 0.0, since it's possible to just ignore them and treat them like walls.
			if (cellValue < 0.0) isWall = true;
			//Ignore cells that are already captured
			if (cell.captured) isWall = true;
			if (isWall) cellValue = 0.0;
			//Skip the outward neighbors for the outermost ring, and also cells that are walls.
			if (ply != maxPly && !isWall) {
				//By only looking at OUTER neighbors we can ensure we only visit cells have that have already been visited before
				const outerValue = outerNeighbors(map, cell, centerCell).map(neighbor => result.get(neighbor) || 0.0).reduce((prev, curr) => prev + curr, 0);
				cellValue += outerValue * (1 - (growConfig.valueDropoff || 0));
			}
			result.set(cell, cellValue);
		}
	}
	return result;
};

class Urn<T> {

	private _rnd : RandomGenerator | null;
	private _sum : number;
	private _items : Map<T | null, number>;

	constructor(rnd : RandomGenerator | null) {
		this._rnd = rnd;
		this._sum = 0.0;
		this._items = new Map();
	}

	add(item : T | null, count = 1) {
		this._sum += count;
		this._items.set(item, count);
	}

	pick() : T | null {
		if (!this._rnd) throw new Error('No Rnd provided');
		const val = this._rnd.quick() * this._sum;
		let sum = 0.0;
		const entries = [...this._items.entries()];
		for (let [item, count] of entries) {
			sum += count;
			if (sum > val) return item;
		}
		return entries[entries.length][0];
	}
}

const shuffleArray = <T>(array : T[] , rnd : RandomGenerator) : void => {
	//based on the answer at https://stackoverflow.com/a/12646864
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(rnd.quick() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

const growMap = (map : ExpandedFrameData, config : GrowConfiguration) : void => {
	if (typeof config != 'object') config = {};
	config = {...defaultGrowConfig(), ...config};
	//TODO: use seed passed in config or something like JSON serialization of map
	const seed = config.seed === true ? undefined : config.seed;
	const rnd = prng_alea(seed);
	const possibilities = [];
	const activeCells = map.cells.filter(cell => cell.active);
	//We shuffle the order we visit activeCells, otherwise it's possible to get
	//in a state where the first item in a blank field always goes diagonally to
	//the right (for example) because it's the first item each time. Shuffling
	//them helps make sure the order changes enough to get more randomness.
	shuffleArray(activeCells, rnd);
	for (const cell of activeCells) {
		let neighbors : CellData[] = [];
		const offsets = [-1, 0, 1];
		for (const rOffset of offsets) {
			for (const cOffset of offsets) {
				if (rOffset == 0 && cOffset == 0) continue;
				const neighbor = getCellFromMap(map, cell.row + rOffset, cell.col + cOffset);
				if (!neighbor) continue;
				if (neighbor.value === null) continue;
				if (typeof neighbor.value === 'string') continue;
				if (neighbor.value < 0.0) continue;
				if (neighbor.value === null || neighbor.value === undefined) continue;
				if (neighbor.captured) continue;
				neighbors.push(neighbor);
			}
		}
		if (neighbors.length == 0) {
			//Don't try this one in the future, there are no neighbors
			cell.active = false;
			continue;
		}

		const npvMap = netPresentValueMap(map, cell, config);

		const valueSelectionStrength = (1.0 - (config.randomness || 0)) * 1000;

		const neighborsUrn = new Urn<CellData>(rnd);

		//Shuffle so that when everything's the same value we don't just always
		//pick the upper left.
		shuffleArray(neighbors, rnd);

		//Best neighbors are first. Put them into the urn with much higher probability.
		neighbors.map((neighbor) => {
			//scale based on goodness and randomness strength
			//Ensure nothing gets a value of 0.
			const multiplier = (Math.pow(npvMap.get(neighbor), 2) * valueSelectionStrength) + 1;
			neighborsUrn.add(neighbor, multiplier);
		});

		const neighbor = neighborsUrn.pick();

		if (!neighbor) throw new Error('Null neighbor');

		possibilities.push({
			neighbor,
			cell,
			value: npvMap.get(neighbor),
		});
	}

	//ascending values
	possibilities.sort((a, b) => a.value - b.value);
	//We should take the smalle rof config.proportion and config.numCellsToGrow. config.numCellsToGrow of 0.0 means no limit
	let numToSelect = Math.min(activeCells.length * (config.proportion || 0), config.numCellsToGrow || Number.MAX_SAFE_INTEGER);
	while (possibilities.length && numToSelect) {
		//TODO: allow configuring this to not take the best but every so often take a random one.
		const item = possibilities.pop();
		if (!item) throw new Error("Unexpectedly no item");
		item.neighbor.active = true;
		item.neighbor.captured = true;
		//If we don't kill the original active cell, then we branch.
		if (rnd.quick() > (config.branchLikelihood || 0.0)) item.cell.active = false;
		numToSelect--;
	}

};

const MAX_VALUE_NAME = 'max';
const MIN_VALUE_NAME = 'min';
const POSITIVE_VALUE_NAME = 'positive';
const NEGATIVE_VALUE_NAME = 'negative';
const EMPTY_VALUE_NAME = 'null';
const ZERO_VALUE_NAME = 'zero';

const DEFAULT_PROPORTIONS : Proportions = {
	max: 100,
	min: 15,
	positive: 100,
	negative: 5,
	null: 15,
	zero: 25
};	

const defaultGenerateConfig = () : GenerateConfiguration => {
	return {
		seed: 'seed',
		keyCellProportion: 0.6,
		proportions: {...DEFAULT_PROPORTIONS},
	};
};

//Values are binned in what's generated, into this many bins.
const VALUE_BIN_COUNT = 5;

const proportionForUrnKey = (config : GenerateConfiguration, key : keyof Proportions | number) => {
	const configProportions = config.proportions || {};
	const proportions = {...DEFAULT_PROPORTIONS, ...configProportions} as Record<string | number, number>;
	let specialKey = (typeof key == 'number' && key < 0.0) ? NEGATIVE_VALUE_NAME : POSITIVE_VALUE_NAME;
	switch (key) {
	case -1.0:
		specialKey = MIN_VALUE_NAME;
		break;
	case 1.0:
		specialKey = MAX_VALUE_NAME;
		break;
	case 0.0:
		specialKey = ZERO_VALUE_NAME;
		break;
	case null:
		specialKey = EMPTY_VALUE_NAME;
		break;
	}
	const specificProportion = proportions[key];
	if (specificProportion !== undefined) return specificProportion;
	return proportions[specialKey];
};

export const urnFromGenerateConfig = (rnd : RandomGenerator, config : GenerateConfiguration) : Urn<number> => {
	const urn = new Urn<number>(rnd);
	const stepSize = 1 / VALUE_BIN_COUNT;
	for (let i = 0; i <= VALUE_BIN_COUNT * 2; i++) {
		const rawKey = 1.0 - (i * stepSize);
		const roundedKey = parseFloat(rawKey.toPrecision(3));
		const proportion = proportionForUrnKey(config, roundedKey);
		urn.add(roundedKey, proportion);
	}
	const emptyProportion = proportionForUrnKey(config, 'null');
	urn.add(null, emptyProportion);
	return urn;
};

const SENTINEL_VALUE = Number.MAX_SAFE_INTEGER;

const generateMap = (map : ExpandedFrameData, config : GenerateConfiguration) => {
	if (typeof config != 'object') config = {};
	config = {...defaultGenerateConfig(), ...config};
	const seed = config.seed === true ? undefined : config.seed;
	const rnd = prng_alea(seed);
	const urn = urnFromGenerateConfig(rnd, config);
	for (const cell of map.cells) {
		cell.value = SENTINEL_VALUE;
	}
	const cellsToVisit = [];
	for (const cell of map.cells) {
		if (rnd.quick() > (config.keyCellProportion || 0)) continue;
		const pick = urn.pick();
		cell.value = pick;
		//It's OK if we put in duplicates
		cellsToVisit.push(...ringCells(map, cell, 1));
	}
	while (cellsToVisit.length) {
		const cell = cellsToVisit.shift();
		if (!cell) throw new Error("Unexpected undefined item");
		//It's possible it was added it multiple times
		if (cell.value != SENTINEL_VALUE) continue;
		const valueNeighbors = ringCells(map, cell, 1).filter(neighbor => neighbor.value != SENTINEL_VALUE);

		//Set the cell to the mode of its set neighbors
		const counts : Record<string | number, number> = {};
		for (let neighbor of valueNeighbors) {
			const val = neighbor.value === null ? 'null' : neighbor.value;
			counts[val] = (counts[val] || 0) + 1;
		}
		let maxKey : string = '0';
		let maxCount : number = 0;
		for (const [key, count] of Object.entries(counts)) {
			if (count < maxCount) continue;
			maxCount = count;
			maxKey = key;
		}
		//null is a valid key, but will be coerced to the string 'null'
		cell.value = maxKey == 'null' ? null : parseFloat(maxKey);
		//Enqueue nearby cells to process
		cellsToVisit.push(...ringCells(map, cell, 1));
	}
};

class Frame {

	private _collection : FrameCollection;
	private _index : number;
	private _rawData : ConfigDataItem;
	private _cachedData : ExpandedFrameData | null;

	constructor(collection : FrameCollection, index : number, rawData : ConfigDataItem) {
		this._collection = collection;
		this._index = index;
		this._rawData = rawData;
		this._cachedData = null;
	}

	get index() {
		return this._index;
	}

	_computeData() {
		let previous : ExpandedFrameData | undefined;
		if (this._rawData[RESET_TO_COMMAND]) {
			const previousMap = this._collection.frameForName(this._rawData[RESET_TO_COMMAND]);
			if (!previousMap) throw new Error("No such previous with that name");
			if (previousMap.index > this._index) throw new Error("The named map is after us but must be before");
			previous = previousMap.expandedData;
		} else if (this._index > 0) {
			const frame = this._collection.frameForIndex(this._index - 1);
			if (!frame) throw new Error("Unexpected missing frame");
			previous = frame.expandedData;
		} else {
			previous = defaultExpandedFrameForCells([]);
		}
		const result = {...previous};

		//Unset it if set from previous, as it should only affect this frame.
		delete result.gif;
		let gifCommand = this._rawData[GIF_COMMAND];
		if (gifCommand !== undefined) {
			if (typeof gifCommand == 'object') {
				gifCommand = gifCommand.name || '';
			}
			result.gif = gifCommand === true ? '' : gifCommand;
		}

		const sizeCommand = this._rawData[SET_SIZE_COMMAND];
		if (this._index == 0 && !sizeCommand) throw new Error("First item did not have a set size");
		if (sizeCommand) {
			if (!Array.isArray(sizeCommand)) throw new Error("size command not an array");
			if (sizeCommand.length != 2) throw new Error("Size command expects array of lenght 2");
			result.cells = defaultCellsForSize(...sizeCommand);
			result.rows = sizeCommand[0];
			result.cols = sizeCommand[1];
		}

		let setAdjacentPossibleStepsCommand = this._rawData[SET_ADJACENT_POSSIBLE_STEPS_COMMAND];
		if (setAdjacentPossibleStepsCommand !== undefined) {
			if (typeof setAdjacentPossibleStepsCommand != 'number') throw new Error("Adjacent possible steps expects a number");
			if (setAdjacentPossibleStepsCommand < 0.0) setAdjacentPossibleStepsCommand = 0.0;
			setAdjacentPossibleStepsCommand = Math.round(setAdjacentPossibleStepsCommand);
			result.adjacentPossibleSteps = setAdjacentPossibleStepsCommand;
		}

		let scaleCommand = this._rawData[SET_SCALE_COMMAND];
		if (scaleCommand !== undefined) {
			if (typeof scaleCommand != 'number') throw new Error("Scale must be a number");
			if (scaleCommand < 0.0) scaleCommand = 0.0;
			result.scale = scaleCommand;
		}

		let colorsCommand = this._rawData[SET_COLORS_COMMAND];
		if (colorsCommand !== undefined) {
			if (typeof colorsCommand != 'object') throw new Error('Colors must be provided an object');
			const unknownColorKeys = Object.keys(colorsCommand).filter(key => (DEFAULT_COLORS as Record<string, ExpandedColor>)[key] === undefined);

			if (unknownColorKeys.length) throw new Error("Unknown color keys: " + unknownColorKeys.join(','));
			const keysToSetToDefault : (keyof Colors<ExpandedColor>)[] = Object.entries(colorsCommand).filter(entry => entry[1] === null || entry[1] === undefined).map(entry => entry[0]) as (keyof Colors<ExpandedColor>)[];

			//undefined (the sentinel to reset to default) won't throw
			let convertedColors;
			try {
				convertedColors = Object.fromEntries(Object.entries(colorsCommand).map(entry => [entry[0], color(entry[1])]));
			} catch(err) {
				throw new Error("Invalid color value: " + err);
			}

			//We'll copy over the colors from previous and then overlay new colors
			const effectiveColors = {...previous.colors, ...convertedColors};
			//Now we'll go throw and delete any that were set to undefined (the signal to reset to default)
			for (const keyToSetToDefault of keysToSetToDefault) {
				delete effectiveColors[keyToSetToDefault];
			}
			//And finally overlay the effective colors over the default ones, so
			//that any holes created by undefined are filled, and all colors are
			//set.
			result.colors = {...DEFAULT_COLORS, ...effectiveColors};
		}

		//Copy cells so we can modify them
		result.cells = result.cells.map(cell => ({...cell}));

		let resetCommands = this._rawData.reset;
		if (resetCommands) {
			for (const resetCommand of resetCommands) {
				resetCellsOnMap(result, resetCommand);
			}
		}

		let randomizeCommand = this._rawData.randomize;
		if (randomizeCommand) {
			const commands = Array.isArray(randomizeCommand) ? randomizeCommand : [randomizeCommand];
			for (const command of commands) {
				randomizeMap(result, command);
			}
		}

		let generateCommand = this._rawData[GENERATE_COMMAND];
		if (generateCommand) {
			generateMap(result, generateCommand);
		}

		for (const [commandName, propertyNames] of TypedObject.entries(SET_CELL_COMMANDS)) {
			const commands = this._rawData[commandName];
			if (commands) {
				for (const command of commands) {
					const valueToSet = command[0];
					const cellReference = command[1];
					for (const propertyName of propertyNames) {
						setPropertiesOnMap(result, propertyName, valueToSet, cellReference);
					}
				}
			}	
		}

		let nudgeCommands = this._rawData.nudge;
		if (nudgeCommands) {
			if (!Array.isArray(nudgeCommands)) throw new Error('nudge must be an array');
			for (const nudgeCommand of nudgeCommands) {
				if (!Array.isArray(nudgeCommand)) throw new Error('nudge command must be an array');
				if (nudgeCommand.length != 2) throw new Error('nudge command expects 2 items');
				if (!Array.isArray(nudgeCommand[0]) || nudgeCommand[0].length != 2) throw new Error('The first argument to a nudge command must be a size');
				nudgeMap(result, nudgeCommand[1], nudgeCommand[0]);
			}
		}

		let moveCommand = this._rawData.move;
		if (moveCommand) {
			if (moveCommand !== true) throw new Error('Move command must be true')
			moveMap(result);
		}

		let growCommand = this._rawData[GROW_COMMAND];
		if (growCommand) {
			//do auto opacity before doing the growMap calculation, we'll have
			//to do it again later after growMap is done.
			setAutoOpacity(result);
			growMap(result, growCommand);
		}

		setAutoOpacity(result);

		//Catch bugs easier if we later try to modify this, which should be immutable
		Object.freeze(result);
		for (let cell of result.cells) {
			Object.freeze(cell);
		}

		this._cachedData = result;
	}

	get expandedData() : ExpandedFrameData {
		if (!this._cachedData) {
			this._computeData();
		}
		if (!this._cachedData) throw new Error('computeData didn\'t compute data as expected');
		return this._cachedData;
	}
}

const expandRawBlocks = (data : ConfigData) : ConfigData => {
	const result = [];
	for (const item of data) {
		if (item[DISABLE_COMMAND]) continue;
		const repeatCount = item[REPEAT_COMMAND] || 1;
		for (let i = 0; i < repeatCount; i++) {
			result.push(item);
		}
	}
	return result;
};

export class FrameCollection {

	private _data : ConfigData;
	private _memoizedMaps : Record<number, Frame>;

	constructor(data : ConfigData) {
		data = expandRawBlocks(data);
		this._data = data || [];
		this._memoizedMaps = {};
	}

	get length() {
		return this._data.length;
	}

	frameForName(name : string) : Frame | null {
		for (let i = 0; i < this._data.length; i++) {
			if (this._data[i].name == name) return this.frameForIndex(i);
		}
		return null;
	}

	frameForIndex(index : number) : Frame | null {
		if (index < 0 || index >= this._data.length) return null;
		if (!this._memoizedMaps[index]) {
			this._memoizedMaps[index] = new Frame(this, index, this._data[index]);
		}
		return this._memoizedMaps[index];
	}
}