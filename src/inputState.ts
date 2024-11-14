import { UserInputService } from "@rbxts/services"
import {
	GAMEPAD_BUTTONS,
	GAMEPAD_THUMBSTICKS,
	type Gamepad,
	type Input,
	MOUSE_BUTTONS,
	type NativeInput,
} from "./inputs"
import { Multiply2d } from "./multiply2d"
import { VirtualAxis } from "./virtualAxis"
import { VirtualAxis2d } from "./virtualAxis2d"

interface State {
	keycodes: Map<NativeInput, boolean>
	mouseButtons: Map<NativeInput, boolean>
	mouseWheel: number
	mouseDelta: Vector2
	gamepadButtons: Map<NativeInput, Map<Enum.UserInputType, boolean>>
	gamepadThumbsticks: Map<NativeInput, Map<Enum.UserInputType, Vector2>>
}

export class InputState {
	private state: State

	constructor() {
		this.state = {
			keycodes: new Map(),
			mouseButtons: new Map(),
			mouseWheel: 0,
			mouseDelta: Vector2.zero,
			gamepadButtons: new Map(
				[...GAMEPAD_BUTTONS].map((keycode) => [keycode, new Map()]),
			),
			gamepadThumbsticks: new Map(
				[...GAMEPAD_THUMBSTICKS].map((keycode) => [keycode, new Map()]),
			),
		}

		UserInputService.InputBegan.Connect((object, sunk) =>
			this.onInputBeganOrEnded(object, sunk),
		)
		UserInputService.InputEnded.Connect((object, sunk) =>
			this.onInputBeganOrEnded(object, sunk),
		)
		UserInputService.InputChanged.Connect((object, sunk) =>
			this.onInputChanged(object, sunk),
		)
	}

	clear() {
		this.state.mouseWheel = 0
		this.state.mouseDelta = Vector2.zero
	}

	value(input: Input, gamepad?: Gamepad): number {
		if (typeIs(input, "EnumItem")) {
			if (input.IsA("KeyCode")) {
				if (GAMEPAD_THUMBSTICKS.has(input)) {
					if (gamepad === undefined) return 0

					const value = this.state.gamepadThumbsticks
						.get(input)
						?.get(gamepad)

					if (value === undefined || value.Magnitude === 0) {
						return 0
					}

					return value.Magnitude
				}

				if (GAMEPAD_BUTTONS.has(input)) {
					if (gamepad === undefined) return 0

					return this.state.gamepadButtons.get(input)?.get(gamepad)
						? 1
						: 0
				}

				return this.state.keycodes.get(input) ? 1 : 0
			}

			if (MOUSE_BUTTONS.has(input)) {
				return this.state.mouseButtons.get(input) ? 1 : 0
			}

			if (input === Enum.UserInputType.MouseMovement) {
				return this.state.mouseDelta.Magnitude
			}

			if (input === Enum.UserInputType.MouseWheel) {
				return this.state.mouseWheel
			}
		}

		if (input instanceof VirtualAxis) {
			const positive = input.positive
				? this.value(input.positive, gamepad)
				: 0
			const negative = input.negative
				? this.value(input.negative, gamepad)
				: 0

			return positive - negative
		}

		const virtualAxis2d = input instanceof VirtualAxis2d
		const multiply2d = input instanceof Multiply2d

		if (virtualAxis2d || multiply2d) {
			const axis = this.axis2d(input, gamepad)
			return axis ? axis.Magnitude : 0
		}

		error(`Invalid input: ${tostring(input)}`)
	}

	axis2d(input: Input, gamepad?: Gamepad): Vector2 | undefined {
		if (typeIs(input, "EnumItem")) {
			if (input === Enum.UserInputType.MouseMovement) {
				return this.state.mouseDelta
			}

			if (GAMEPAD_THUMBSTICKS.has(input)) {
				if (gamepad === undefined) return Vector2.zero

				const value = this.state.gamepadThumbsticks
					.get(input)
					?.get(gamepad)

				if (value === undefined || value.Magnitude < 0.5) {
					return Vector2.zero
				}

				return value
			}
		}

		if (input instanceof VirtualAxis2d) {
			const right = input.right ? this.value(input.right, gamepad) : 0
			const left = input.left ? this.value(input.left, gamepad) : 0
			const up = input.up ? this.value(input.up, gamepad) : 0
			const down = input.down ? this.value(input.down, gamepad) : 0

			return new Vector2(right - left, up - down)
		}

		if (input instanceof Multiply2d) {
			const value = this.axis2d(input.input, gamepad)

			return value?.mul(input.multiplier)
		}

		return undefined
	}

	pressed(input: Input, gamepad?: Gamepad): boolean {
		if (typeIs(input, "EnumItem")) {
			if (input.IsA("KeyCode")) {
				if (GAMEPAD_THUMBSTICKS.has(input)) {
					if (gamepad === undefined) return false

					const value = this.state.gamepadThumbsticks
						.get(input)
						?.get(gamepad)

					return value ? value.Magnitude > 0 : false
				}

				if (GAMEPAD_BUTTONS.has(input)) {
					if (gamepad === undefined) return false

					const value = this.state.gamepadButtons
						.get(input)
						?.get(gamepad)

					return value ?? false
				}

				return this.state.keycodes.get(input) ?? false
			}

			if (MOUSE_BUTTONS.has(input)) {
				return this.state.mouseButtons.get(input) ?? false
			}

			if (input === Enum.UserInputType.MouseMovement) {
				return this.state.mouseDelta.Magnitude > 0
			}

			if (input === Enum.UserInputType.MouseWheel) {
				return this.state.mouseWheel !== 0
			}
		}

		if (input instanceof VirtualAxis) {
			return this.value(input, gamepad) > 0
		}

		const virtualAxis2d = input instanceof VirtualAxis2d
		const multiply2d = input instanceof Multiply2d

		if (virtualAxis2d || multiply2d) {
			const value = this.axis2d(input, gamepad)
			return value ? value.Magnitude > 0 : false
		}

		throw `Invalid input "${tostring(input)}"`
	}

	anyPressed(inputs: Input[], gamepad?: Gamepad): boolean {
		for (const input of inputs) {
			if (this.pressed(input, gamepad)) {
				return true
			}
		}

		return false
	}

	private onInputBeganOrEnded(object: InputObject, sunk: boolean) {
		if (sunk) return

		const keycode = object.KeyCode
		const inputType = object.UserInputType
		const isBegin = object.UserInputState === Enum.UserInputState.Begin

		if (MOUSE_BUTTONS.has(object.UserInputType)) {
			this.state.mouseButtons.set(inputType, isBegin)
		} else if (GAMEPAD_BUTTONS.has(keycode)) {
			const gamepad = this.state.gamepadButtons.get(keycode)
			if (gamepad) {
				gamepad.set(inputType, isBegin)
			}
		} else if (keycode !== Enum.KeyCode.Unknown) {
			this.state.keycodes.set(keycode, isBegin)
		}
	}

	private onInputChanged(object: InputObject, sunk: boolean) {
		if (sunk) return

		const keycode = object.KeyCode
		const inputType = object.UserInputType

		if (inputType === Enum.UserInputType.MouseMovement) {
			this.state.mouseDelta = new Vector2(object.Delta.X, -object.Delta.Y)
		} else if (inputType === Enum.UserInputType.MouseWheel) {
			this.state.mouseWheel = object.Position.Z
		} else if (GAMEPAD_THUMBSTICKS.has(keycode)) {
			const input = this.state.gamepadThumbsticks.get(keycode)
			if (input) {
				input.set(
					inputType,
					new Vector2(object.Position.X, object.Position.Y),
				)
			}
		}
	}
}
