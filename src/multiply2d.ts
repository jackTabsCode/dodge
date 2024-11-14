import type { Input2d } from "./inputs"

export class Multiply2d {
	input: Input2d
	multiplier: Vector2

	constructor(input: Input2d, multiplier: Vector2) {
		this.input = input
		this.multiplier = multiplier
	}
}
