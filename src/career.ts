import { Uma } from "./models/uma";



export enum CareerAction {
    REST = 'rest',
    TRAINING = 'training', 
    SKILLS = 'skills',
    RECREATION = 'recreation',
    RACES = 'races'
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

    constructor(uma: Uma) {
        this.state = {
            turn: 1,
            energy: 100,
            uma: uma,
            isComplete: false
        };
    }

    get State(): CareerState {
        return { ...this.state };
    }

    get AvailableActions(): CareerAction[] {
        return [
            CareerAction.REST,
            CareerAction.TRAINING,
            CareerAction.SKILLS,
            CareerAction.RECREATION,
            CareerAction.RACES
        ];
    }

    executeAction(action: CareerAction): void {
        if (this.state.isComplete) {
            throw new Error('Career is already complete');
        }

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

        this.advanceTurn();
    }

    private handleRest(): void {
        this.state.energy = Math.min(100, this.state.energy + 30);
        console.log(`Turn ${this.state.turn}: Resting (+30 energy, now ${this.state.energy})`);
    }

    private handleTraining(): void {
        this.state.energy = Math.max(0, this.state.energy - 20);
        console.log(`Turn ${this.state.turn}: Training (-20 energy, now ${this.state.energy})`);
        // TODO: Add stat gains and training effects
    }

    private handleSkills(): void {
        this.state.energy = Math.max(0, this.state.energy - 10);
        console.log(`Turn ${this.state.turn}: Learning skills (-10 energy, now ${this.state.energy})`);
        // TODO: Add skill learning mechanics
    }

    private handleRecreation(): void {
        this.state.energy = Math.min(100, this.state.energy + 10);
        console.log(`Turn ${this.state.turn}: Recreation (+10 energy, now ${this.state.energy})`);
        // TODO: Add recreation benefits
    }

    private handleRaces(): void {
        this.state.energy = Math.max(0, this.state.energy - 30);
        console.log(`Turn ${this.state.turn}: Racing (-30 energy, now ${this.state.energy})`);
        // TODO: Add race simulation and rewards
    }

    private advanceTurn(): void {
        this.state.turn++;
        if (this.state.turn > this.maxTurns) {
            this.state.isComplete = true;
            console.log('Career complete!');
        }
    }

    get isComplete(): boolean {
        return this.state.isComplete;
    }
}