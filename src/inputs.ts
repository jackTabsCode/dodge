import type { Multiply2d } from "./multiply2d"
import type { VirtualAxis2d } from "./virtualAxis2d"

export type NativeInput = Enum.UserInputType | Enum.KeyCode
export type Input2d = NativeInput | VirtualAxis2d

export type Input = NativeInput | Input2d | Multiply2d

export type Gamepad =
	| Enum.UserInputType.Gamepad1
	| Enum.UserInputType.Gamepad2
	| Enum.UserInputType.Gamepad3
	| Enum.UserInputType.Gamepad4
	| Enum.UserInputType.Gamepad5
	| Enum.UserInputType.Gamepad6
	| Enum.UserInputType.Gamepad7
	| Enum.UserInputType.Gamepad8

export const GAMEPAD_BUTTONS: Set<NativeInput> = new Set([
	Enum.KeyCode.ButtonA,
	Enum.KeyCode.ButtonB,
	Enum.KeyCode.ButtonX,
	Enum.KeyCode.ButtonY,
	Enum.KeyCode.ButtonL1,
	Enum.KeyCode.ButtonL2,
	Enum.KeyCode.ButtonL3,
	Enum.KeyCode.ButtonR1,
	Enum.KeyCode.ButtonR2,
	Enum.KeyCode.ButtonR3,
	Enum.KeyCode.DPadUp,
	Enum.KeyCode.DPadDown,
	Enum.KeyCode.DPadLeft,
	Enum.KeyCode.DPadRight,
	Enum.KeyCode.ButtonStart,
	Enum.KeyCode.ButtonSelect,
])

export const GAMEPAD_THUMBSTICKS: Set<NativeInput> = new Set([
	Enum.KeyCode.Thumbstick1,
	Enum.KeyCode.Thumbstick2,
])

export const MOUSE_BUTTONS: Set<NativeInput> = new Set([
	Enum.UserInputType.MouseButton1,
	Enum.UserInputType.MouseButton2,
	Enum.UserInputType.MouseButton3,
])
