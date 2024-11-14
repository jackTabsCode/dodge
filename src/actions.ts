import { UserInputService } from "@rbxts/services"
import type { InputMap } from "./inputMap"
import type { InputState } from "./inputState"
import type { Gamepad } from "./inputs"
import { Signal } from "./signal"

interface ActionState {
	manualHolds: number
	manualMove: Vector2
	pressed: boolean
	value: number
	axis2d: Vector2
}

const DEFAULT_ACTION_STATE: ActionState = {
	manualHolds: 0,
	manualMove: Vector2.zero,
	pressed: false,
	value: 0,
	axis2d: Vector2.zero,
}

export class Actions<A extends string> {
	private readonly state: { [action in A]: ActionState } = {} as never

	private readonly justPressedSignals: { [action in A]: Signal } = {} as never
	private readonly justReleasedSignals: { [action in A]: Signal } =
		{} as never

	private gamepads: Gamepad[] =
		UserInputService.GetConnectedGamepads() as Gamepad[]

	constructor(actions: A[]) {
		for (const action of actions) {
			this.state[action] = { ...DEFAULT_ACTION_STATE }
			this.justPressedSignals[action] = new Signal()
			this.justReleasedSignals[action] = new Signal()
		}

		UserInputService.GamepadConnected.Connect((gamepad) => {
			if (!this.gamepads.includes(gamepad as Gamepad)) {
				this.gamepads.push(gamepad as Gamepad)
			}
		})

		UserInputService.GamepadDisconnected.Connect((gamepad) => {
			const index = this.gamepads.indexOf(gamepad as Gamepad)
			if (index !== -1) {
				this.gamepads.remove(index)
			}
		})
	}

	private getFirstGamepad() {
		let gamepad = this.gamepads[0]

		for (const gp of this.gamepads) {
			if (!gamepad || gp.Value < gamepad.Value) {
				gamepad = gp
			}
		}

		return gamepad
	}

	update(inputState: InputState, inputMap: InputMap<A>) {
		const gamepad = this.getFirstGamepad()

		for (const [action, state] of pairs(this.state) as IterableFunction<
			LuaTuple<[A, ActionState]>
		>) {
			const inputs = inputMap.get(action)
			const pressed =
				state.manualHolds > 0 ||
				state.manualMove.Magnitude > 0 ||
				inputState.anyPressed(inputs, gamepad)
			const wasPressed = state.pressed

			state.pressed = pressed

			let value = 0
			for (const input of inputs) {
				value += inputState.value(input, gamepad)
			}

			state.value = value + state.manualMove.Magnitude + state.manualHolds

			let axis2d = state.manualMove
			for (const input of inputs) {
				const inputValue = inputState.axis2d(input, gamepad)

				if (inputValue !== undefined) {
					axis2d = axis2d.add(inputValue)
				}
			}

			state.axis2d = axis2d

			state.manualMove = Vector2.zero

			if (pressed && !wasPressed) {
				this.justPressedSignals[action].fire()
			} else if (!pressed && wasPressed) {
				this.justReleasedSignals[action].fire()
			}
		}
	}

	axis2d(action: A) {
		return this.state[action].axis2d
	}

	hold(action: A): () => void {
		let cleanedUp = false
		this.state[action].manualHolds += 1

		return () => {
			if (!cleanedUp) {
				cleanedUp = true
				this.state[action].manualHolds -= 1
			}
		}
	}

	pressed(action: A) {
		return this.state[action].pressed
	}

	released(action: A) {
		return !this.pressed(action)
	}

	value(action: A) {
		return this.state[action].value
	}

	justPressedSignal(action: A) {
		return this.justPressedSignals[action]
	}

	justReleasedSignal(action: A) {
		return this.justReleasedSignals[action]
	}
}
