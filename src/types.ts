export type RandomGenerator = {
    quick: () => number;
};

type Size = [number, number];

//TODO: type more tightly
type Color = string | [number, number, number] | [number, number, number, number];

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

type Colors<C extends ResettableColor | ExpandedColor>= {
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

type GrowConfiguration = {
    seed? : string;
    randomness? : number;
    proportion? : number;
    numCellsToGrow? : number;
    valuePly? : number;
    valueDropoff? : number;
    branchLikelihood? : number;
};

export type GenerateConfiguration = {
    seed? : string | true;
    keyCellProportion? : number;
    proportions? : {
        max? : number;
        min? : number;
        positive? : number;
        negative? : number;
        zero? : number;
        null? : number;
    }
};

type CellReference = [number, number] | [number, number, number, number] | [];

type CellValue<V> = [V, CellReference][];

export type ConfigDataItem = {
    setSize? : Size;
    setAdjacentPossibleSteps? : number;
    setScale? : number;
    setColors? : Partial<Colors<ResettableColor>>;
    description? : string;
    name? : string;
    resetTo? : string;
    repeat? : number;
    disable? : true;
    gif? : GifConfiguration | string | true;
    grow? : GrowConfiguration;
    generate? : GenerateConfiguration;
    value? : CellValue<number | null>;
    highlighted? : CellValue<boolean>;
    captured? : CellValue<boolean>;
    active? : CellValue<boolean>;
    activeOnly? : CellValue<boolean>;
    opacity? : CellValue<number>;
    fillOpacity? : CellValue<number>;
    strokeOpacity? : CellValue<number>;
    scale? : CellValue<number>;
};

export type ConfigData = ConfigDataItem[];

export type CellData = {
    row: number;
    col: number;
    value: number;
    highlighted: boolean;
    captured: boolean;
    active: boolean;
    scale: number;
    fillOpacity? : number;
    strokeOpacity? : number;
    autoOpacity : number;
}

export type ExpandedFrameData = {
    rows: number;
    cols: number;
    adjacentPossibleSteps: number;
    colors: Colors<ExpandedColor>,
    scale : number,
    cells: CellData[]
    gif? : string;
}