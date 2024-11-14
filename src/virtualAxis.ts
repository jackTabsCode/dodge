import type { NativeInput } from "./inputs"

export interface VirtualAxisOptions {
	positive?: NativeInput
	negative?: NativeInput
}

export class VirtualAxis {
	positive?: NativeInput
	negative?: NativeInput

	constructor(options: VirtualAxisOptions) {
		this.positive = options.positive
		this.negative = options.negative
	}

	static horizontalArrowKeys() {
		return new VirtualAxis({
			positive: Enum.KeyCode.Right,
			negative: Enum.KeyCode.Left,
		})
	}

	static verticalArrowKeys() {
		return new VirtualAxis({
			positive: Enum.KeyCode.Up,
			negative: Enum.KeyCode.Down,
		})
	}
}
