import { Condition } from "./enums/condition";
import { Recreation } from "./enums/recreation";
import { Uma } from "./models/uma";
import { MenuSystem } from "./utils/menu-system";
import { TrainingAction } from "./interfaces/training-action";
import { Training } from "./training";

export enum CareerAction {
	REST = "rest",
	TRAINING = "training",
	SKILLS = "skills",
	RECREATION = "recreation",
	RACES = "races",
}

export interface CareerState {
	turn: number;
	energy: number;
	uma: Uma;
	isComplete: boolean;
}

export class Career {
	private state: CareerState;
	private maxTurns: number = 72;
	private training: Training;

	constructor(uma: Uma) {
		this.state = {
			turn: 1,
			energy: 100,
			uma: uma,
			isComplete: false,
		};

		this.training = new Training(uma);
	}

	get State(): CareerState {
		return { ...this.state };
	}

	get AvailableActions(): (CareerAction | TrainingAction)[] {
		return [
			CareerAction.REST,
			CareerAction.TRAINING,
			CareerAction.SKILLS,
			CareerAction.RECREATION,
			CareerAction.RACES,
		];
	}

	executeAction(action: CareerAction | TrainingAction): void {
		if (this.state.isComplete) {
			throw new Error("Career is already complete");
		}

		if (Object.values(CareerAction).includes(action as CareerAction))
			this.handleCareerAction(action as CareerAction);
		else if (Object.values(TrainingAction).includes(action as TrainingAction))
			this.handleTrainingAction(action as TrainingAction);
		else {
			console.error(`Unknown action type: ${action}`);
			return;
		}


		this.advanceTurn();
	}

	private handleTrainingAction(action: TrainingAction): void {
		if (action === TrainingAction.BACK)
			this.trainingBack();
		else
			this.trainStat(action);
	}

	private trainingBack(): void {
		
	}
	
	private trainStat(action: TrainingAction): void {

	}

	private handleCareerAction(action: CareerAction): void {
		switch (action) {
			case CareerAction.REST:
				this.handleRest();
				break;
			case CareerAction.TRAINING:
				this.handleTraining();
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
		const addedEnergy = this.handleEnergyRoll(Math.random() * 100);
		this.state.energy = Math.min(
			this.state.uma.MaxEnergy,
			this.state.energy + addedEnergy
		);
		console.log(
			`Turn ${this.state.turn}: Resting (${addedEnergy}, now ${this.state.energy})`
		);
		// TODO: add option for summer camp, rest recovers 40 energy and adds 1 to mood
	}

	private handleEnergyRoll(roll: number) {
		if (roll <= 12.5) {
			const intRoll = Math.floor(Math.random() * 5);
			if (intRoll === 0) this.state.uma.addCondition(Condition.NIGHT_OWL);
			return 30;
		} else if (roll > 12.5 && roll <= 65) {
			return 50;
		} else {
			return 70;
		}
	}

	private handleTraining(): void {
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

	// Rolls to see if you get claw game. Assumes you win a 1 mood boost
	private rollForClawGame(): void {
		const roll = Math.floor(Math.random() * 4);
		if (roll === 0) {
			this.changeMood(1);
			this.addEnergy(10);
			// TODO: Add hint for straightaway recovery
		}
	}

	private changeMood(amount: number): void {
		this.state.uma.Mood = amount;
	}

	private addEnergy(addedEnergy: number): void {
		this.state.energy = Math.min(
			this.state.uma.MaxEnergy,
			this.state.energy + addedEnergy
		);
		console.log(
			`Turn ${this.state.turn}: Resting (${addedEnergy}, now ${this.state.energy})`
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
