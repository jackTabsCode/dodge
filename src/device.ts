import type { NativeInput } from "./inputs"

export enum Device {
	Mouse = 0,
	Keyboard = 1,
	Gamepad1 = 2,
}

export function getDeviceFromNativeInput(
	input: NativeInput,
): Device | undefined {
	if (input.IsA("UserInputType")) {
		if (input.Name.match("^Gamepad")[0] !== undefined) {
			return Device.Gamepad1
		}

		if (input.Name.match("^Mouse")[0] !== undefined) {
			return Device.Mouse
		}

		if (input === Enum.UserInputType.Keyboard) {
			return Device.Keyboard
		}
	} else if (input.IsA("KeyCode")) {
		if (input === Enum.KeyCode.Unknown) {
			return undefined
		}

		if (input.Value >= 1000) {
			return Device.Gamepad1
		}

		return Device.Keyboard
	}
}
