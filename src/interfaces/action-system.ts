export interface MenuAction {
    label: string;
    value: string;
    isBack?: boolean;
    isQuit?: boolean;
}

export interface ActionProvider {
    getAvailableActions(): MenuAction[];
}