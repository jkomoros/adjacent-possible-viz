export type RandomGenerator = {
    quick: () => number;
};

export type Size = [number, number];

//TODO: type more tightly
export type Color = string | [number, number, number] | [number, number, number, number];

type ResettableColor = Color | null;

export type ExpandedColor = {
    r: number;
    g: number;
    b: number;
    a: number;
    hex: string;
    rgb: [number, number, number];
    rgba: [number, number, number, number];
    rgbStr: string;
    rgbaStr: string;
}

export type Colors<C extends ResettableColor | ExpandedColor>= {
    zero : C;
    positive : C;
    negative : C;
    empty : C;
    captured : C;
    highlighted : C;
    background : C;
};

type GifConfiguration = {
    name : string;
    repeat: number;
    delay: number;
};

export type GrowConfiguration = {
    seed? : string | true;
    randomness? : number;
    proportion? : number;
    numCellsToGrow? : number;
    valuePly? : number;
    valueDropoff? : number;
    branchLikelihood? : number;
};

export type Proportions = {
    max : number;
    min : number;
    positive : number;
    negative : number;
    zero : number;
    null : number;
};

export type GenerateConfiguration = {
    seed? : string | true;
    keyCellProportion? : number;
    proportions? : Partial<Proportions>;
};

export type RandomizeConfigurationItem = {
    name: keyof ConfigDataItemSetCellRandomizable;
    seed? : string | true;
    min?: number;
    max?: number;
    relative?: boolean;
    cells? : CellReference;
};

export type ExpandedCellReference = [number, number, number, number];

export type CellReference = [number, number] | [number, number, number, number] | [];

type CellValue<V> = [V, CellReference][];

//These are the command items that directly adhere to CellData
export type ConfigDataItemSetCellDirect = {
    value? : CellValue<number | null>;
    highlighted? : CellValue<boolean>;
    captured? : CellValue<boolean>;
    active? : CellValue<boolean>;
    fillOpacity? : CellValue<number>;
    strokeOpacity? : CellValue<number>;
    scale? : CellValue<number>;
    offsetX? : CellValue<number>;
    offsetY? : CellValue<number>;
    velocityX? : CellValue<number>;
    velocityY? : CellValue<number>;
};

//These are commands that effectively set multiple properties at once.
export type ConfigDataItemSetCellMulti = {
    opacity? : CellValue<number>;
    velocity? : CellValue<number>;
}

export type ConfigDataItemSetCellRandomizable = ConfigDataItemSetCellDirect & ConfigDataItemSetCellMulti;

//These are the commands that can be used to set properties on cell
export type ConfigDataItemSetCell = ConfigDataItemSetCellDirect & ConfigDataItemSetCellMulti & {
    activeOnly? : CellValue<boolean>;
};

export type ConfigDataItem = ConfigDataItemSetCell & {
    setSize? : Size;
    setAdjacentPossibleSteps? : number;
    setScale? : number;
    setColors? : Partial<Colors<ResettableColor>>;
    description? : string;
    name? : string;
    reset?: CellReference[];
    resetTo? : string;
    repeat? : number;
    disable? : true;
    randomize? : RandomizeConfigurationItem | RandomizeConfigurationItem[];
    gif? : GifConfiguration | string | true;
    grow? : GrowConfiguration;
    generate? : GenerateConfiguration;
    nudge? : CellValue<Size>;
    move? : true | number;
}

export type ConfigData = ConfigDataItem[];

export type CellData = {
    row: number;
    col: number;
    offsetX: number;
    offsetY: number;
    velocityX: number;
    velocityY: number;
    value: number | null;
    highlighted: boolean;
    captured: boolean;
    active: boolean;
    scale: number;
    fillOpacity? : number;
    strokeOpacity? : number;
    autoOpacity : number;
}

export type CellPropertyName = keyof CellData;

export type ExpandedFrameData = {
    rows: number;
    cols: number;
    adjacentPossibleSteps: number;
    colors: Colors<ExpandedColor>,
    scale : number,
    cells: CellData[]
    gif? : string;
}

export type AppState = {
    page: string
	pageExtra: string
	offline: boolean
	snackbarOpened: boolean
};

export type DataState = {
    data: ConfigData
	//-1 signals it should be the default value, either 0 or the last state
	index: number
};

export type RootState = {
    app: AppState;
    data: DataState;
}