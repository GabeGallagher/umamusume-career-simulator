import { Condition } from "./enums/condition";
import { Recreation } from "./enums/recreation";
import { Uma } from "./models/uma";
import { TrainingType } from "./enums/training-types";
import { Training } from "./training";
import { Mood } from "./enums/mood";
import { ConditionsMap } from "./interfaces/conditions";
import { Support } from "./models/support";

export enum CareerAction {
	REST = "rest",
	TRAINING = "training",
	SKILLS = "skills",
	RECREATION = "recreation",
	RACES = "races",
	QUIT = "quit",
}

export interface CareerState {
	supports: Support[];
	turn: number;
	energy: number;
	maxEnergy: number;
	mood: Mood;
	uma: Uma;
	isComplete: boolean;
	conditions: ConditionsMap;
}

export class Career {
	private state: CareerState;
	private maxTurns: number = 72;
	private training: Training;

	constructor(uma: Uma, supports: Support[]) {
		this.state = {
			supports: supports,
			turn: 1,
			energy: 100,
			maxEnergy: 100,
			mood: Mood.Normal,
			uma: uma,
			isComplete: false,
			conditions: this.initConditions(),
		};

		this.training = new Training(uma, this);
	}

	get State(): CareerState {
		return { ...this.state };
	}

	get CurrentEnergy(): number {
		return this.state.energy;
	}

	public changeMood(moodChange: number) {
        const newMoodValue = this.state.mood + moodChange;
        const clampedMoodValue = Math.max(0, Math.min(Mood.Great, newMoodValue));
        this.state.mood = clampedMoodValue as Mood;
	}

	get Training(): Training {
		return this.training;
	}
	
	private initConditions(): ConditionsMap {
		const conditions: ConditionsMap = {} as ConditionsMap;

		Object.values(Condition).forEach((condition) => {
			conditions[condition] = false;
		});
		return conditions;
	}
	
	public hasCondition(condition: Condition): boolean {
		return this.state.conditions[condition];
	}

	public addCondition(condition: Condition): void {
		this.state.conditions[condition] = true;
		if (condition === Condition.PRACTICE_PERFECT)
			this.removeCondition(Condition.PRACTICE_POOR);

		if (condition === Condition.PRACTICE_POOR)
			this.removeCondition(Condition.PRACTICE_PERFECT);
	}

	public removeCondition(condition: Condition): void {
		this.state.conditions[condition] = false;
	}

	public executeAction(action: CareerAction | TrainingType): void {
		if (this.state.isComplete) {
			throw new Error("Career is already complete");
		}

		if (Object.values(CareerAction).includes(action as CareerAction))
			this.handleCareerAction(action as CareerAction);
		else if (
			Object.values(TrainingType).includes(action as TrainingType)
		)
			this.handleTrainingAction(action as TrainingType);
		else {
			console.error(`Unknown action type: ${action}`);
			return;
		}

		this.advanceTurn();
	}

	private handleTrainingAction(action: TrainingType): void {
		this.training.train(action);
	}

	private trainingBack(): void {
		console.log("Training back");
		// TODO: implement the new menu system to actually go back to the main menu instead of logging to the console
	}

	private handleCareerAction(action: CareerAction): void {
		switch (action) {
			case CareerAction.REST:
				this.handleRest();
				break;
			case CareerAction.TRAINING:
				this.trainingMenuGoTo();
				break;
			case CareerAction.SKILLS:
				this.handleSkills();
				break;
			case CareerAction.RECREATION:
				this.handleRecreation();
				break;
			case CareerAction.RACES:
				this.handleRaces();
				break;
		}
	}

	private handleRest(): void {
		const addedEnergy: number = this.handleEnergyRoll(Math.random() * 100);
		this.state.energy = Math.min(
			this.state.maxEnergy,
			this.state.energy + addedEnergy
		);
		console.log(
			`Turn ${this.state.turn}: Resting (${addedEnergy}, now ${this.state.energy})`
		);
		// TODO: add option for summer camp, rest recovers 40 energy and adds 1 to mood
	}

	private handleEnergyRoll(roll: number): number {
		if (roll <= 12.5) {
			const intRoll: number = Math.floor(Math.random() * 5);
			if (intRoll === 0) this.addCondition(Condition.NIGHT_OWL);
			return 30;
		} else if (roll > 12.5 && roll <= 65) {
			return 50;
		} else {
			return 70;
		}
	}

	private trainingMenuGoTo(): void {
		this.state.energy = Math.max(0, this.state.energy - 20);
		console.log(
			`Turn ${this.state.turn}: Training (-20 energy, now ${this.state.energy})`
		);
		// TODO: Add stat gains and training effects
		// TODO: I discovered the when a facility levels up, the facility applies the stat increases, then levels up the facility if it has 4 trainings, then subtracts the energy
	}

	private handleSkills(): void {
		this.state.energy = Math.max(0, this.state.energy - 10);
		console.log(
			`Turn ${this.state.turn}: Learning skills (-10 energy, now ${this.state.energy})`
		);
		// TODO: Add skill learning mechanics
	}

	private handleRecreation(): void {
		const roll: number = Math.random() * 100;
		const rec: Recreation = this.recType(roll);
		switch (rec) {
			case Recreation.ShrineGreat:
				this.addEnergy(30);
				this.changeMood(1);
				this.rollForClawGame();
				break;

			case Recreation.ShrineGood:
				this.addEnergy(20);
				this.changeMood(1);
				this.rollForClawGame();
				break;

			case Recreation.ShrineNormal:
				this.addEnergy(10);
				this.changeMood(1);
				this.rollForClawGame();
				break;

			case Recreation.Stroll:
				this.addEnergy(10);
				this.changeMood(1);
				break;

			case Recreation.Karaoke:
				this.changeMood(2);
				break;

			default:
				console.error(`Recreation type: ${rec} not found`);
				break;
		}
	}

	// Rolls to see if you get claw game. Assumes you win a 1 mood boost since this is the statistical average
	private rollForClawGame(): void {
		const roll: number = Math.floor(Math.random() * 4);
		if (roll === 0) {
			this.changeMood(1);
			this.addEnergy(10);
			// TODO: Add hint for straightaway recovery
		}
	}

	public addEnergy(addedEnergy: number): void {
		this.state.energy = Math.min(
			this.state.maxEnergy,
			this.state.energy + addedEnergy
		);
	}

	private recType(roll: number): Recreation {
		if (roll <= 5) return Recreation.ShrineGreat;
		else if (roll > 5 && roll <= 15) return Recreation.ShrineGood;
		else if (roll > 15 && roll <= 35) return Recreation.ShrineNormal;
		else if (roll > 35 && roll <= 65) return Recreation.Stroll;
		else return Recreation.Karaoke;
	}

	private handleRaces(): void {
		this.state.energy = Math.max(0, this.state.energy - 30);
		console.log(
			`Turn ${this.state.turn}: Racing (-30 energy, now ${this.state.energy})`
		);
		// TODO: Add race simulation and rewards
	}

	private advanceTurn(): void {
		this.state.turn++;
		if (this.state.turn > this.maxTurns) {
			this.state.isComplete = true;
			console.log("Career complete!");
		}
	}

	get isComplete(): boolean {
		return this.state.isComplete;
	}
}
