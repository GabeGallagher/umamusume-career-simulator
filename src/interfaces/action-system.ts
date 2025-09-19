export interface MenuAction {
	action: string;
	value: number;
	isBack?: boolean;
	isQuit?: boolean;
}

export interface ActionProvider {
	getAvailableActions(energy?: number): MenuAction[];
}
