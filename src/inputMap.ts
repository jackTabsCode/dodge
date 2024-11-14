import type { Input } from "./inputs"

export class InputMap<A extends string> {
	private map = new Map<A, Input[]>()

	insert(action: A, ...inputs: Input[]) {
		const set = this.map.get(action) ?? []
		for (const input of inputs) {
			if (!set.includes(input)) {
				set.push(input)
			}
		}
		this.map.set(action, set)

		return this
	}

	remove(action: A, input: Input) {
		const set = this.map.get(action)
		if (set) {
			const index = set.indexOf(input)
			if (index !== -1) {
				set.remove(index)
			}
		}

		return this
	}

	get(action: A): Input[] {
		const set = this.map.get(action)
		return set ?? []
	}
}
