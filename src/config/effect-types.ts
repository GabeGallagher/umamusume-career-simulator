/**
 * Effects are found by cross referencing the effect data structure in the
 * support card data with what is written on their page in game tora. Basically,
 * trust me, bro.
 */
export const EFFECT_TYPES = {
	1: "Friendship Bonus",
	2: "Mood Effect",
	3: "Speed Bonus",
	4: "Stamina Bonus",
	5: "Power Bonus",
	6: "Guts Bonus",
	7: "Wit Bonus",
	8: "Training Effectiveness",
	9: "Initial Speed",
	10: "Initial Stamina",
	11: "Initial Power",
	12: "Initial Guts",
	13: "Initial Wit",
	14: "Initial Friendship Gauge",
	15: "Race Bonus",
	16: "Fan Bonus",
	17: "Hint Levels",
	18: "Hint Frequency",
	19: "Specialty Priority",
	20: "Unknown Effect 20",
	21: "Unknown Effect 21",
	22: "Unknown Effect 22",
	23: "Unknown Effect 23",
	24: "Unknown Effect 24",
	25: "Event Recovery",
	26: "Event Effectiveness",
	27: "Failure Protection",
	28: "Energy Cost Reduction",
	29: "Unknown Effect 29",
	30: "Skill Point Bonus",
	31: "Wit Friendship Recovery",
};

export type EffectId = keyof typeof EFFECT_TYPES;

export function getEffectName(id: number): string {
	return EFFECT_TYPES[id as EffectId] || `Unknown Effect ${id}`;
}
