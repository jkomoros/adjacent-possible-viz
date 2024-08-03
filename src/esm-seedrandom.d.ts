declare module 'esm-seedrandom' {
	export function prng_alea(seed : number | string | undefined): {quick: () => number};
}