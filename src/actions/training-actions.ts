import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { TrainingAction } from "../interfaces/training-action";
import { FacilityType, Training } from "../training";

export class TrainingActions implements ActionProvider {
    private training: Training;

    constructor(training: Training) {
        this.training = training;
    }

    getAvailableActions(): MenuAction[] {
        const facilityActions = this.getFacilityActions();
        
        const actions: MenuAction[] = facilityActions.map(action => {
            const gains = this.training.trainingGains(action);
            return {
                label: `${this.getActionLabel(action)} Training (${this.formatGains(gains)})`,
                value: action
            };
        });

        actions.push({ label: 'Back to Main Menu', value: 'back', isBack: true });
        
        return actions;
    }

    private getFacilityActions(): FacilityType[] {
        return [
            TrainingAction.SPEED,
            TrainingAction.STAMINA,
            TrainingAction.POWER,
            TrainingAction.GUTS,
            TrainingAction.WISDOM
        ] as FacilityType[];
    }

    private getActionLabel(action: FacilityType): string {
        return action.charAt(0).toUpperCase() + action.slice(1);
    }

    private formatGains(gains: Record<string, number>): string {
        return Object.entries(gains)
            .map(([stat, value]) => `${stat}+${value}`)
            .join(', ');
    }
}