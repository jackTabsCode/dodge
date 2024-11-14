import type { NativeInput } from "./inputs"

export interface VirtualAxis2dOptions {
	up?: NativeInput
	down?: NativeInput
	left?: NativeInput
	right?: NativeInput
}

export class VirtualAxis2d {
	up?: NativeInput
	down?: NativeInput
	left?: NativeInput
	right?: NativeInput

	constructor(options: VirtualAxis2dOptions) {
		this.up = options.up
		this.down = options.down
		this.left = options.left
		this.right = options.right
	}

	static arrowKeys() {
		return new VirtualAxis2d({
			up: Enum.KeyCode.Up,
			down: Enum.KeyCode.Down,
			left: Enum.KeyCode.Left,
			right: Enum.KeyCode.Right,
		})
	}

	static wasd() {
		return new VirtualAxis2d({
			up: Enum.KeyCode.W,
			down: Enum.KeyCode.S,
			left: Enum.KeyCode.A,
			right: Enum.KeyCode.D,
		})
	}

	static dPad() {
		return new VirtualAxis2d({
			up: Enum.KeyCode.DPadUp,
			down: Enum.KeyCode.DPadDown,
			left: Enum.KeyCode.DPadLeft,
			right: Enum.KeyCode.DPadRight,
		})
	}
}
