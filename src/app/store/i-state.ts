import { IOType } from '../lego-hub';

export interface IState {
    controller: {
        controllerType: ControllerType;
        connectionState: ControllerConnectionState;
        gamepadConfig: GamepadControllerConfig;
        controllerState: ControllerState;
    },
    hub: {
        connectionState: HubConnectionState,
        batteryLevel: number | null;
        name: string | null;
        rssiLevel: number | null;
        attachedIOs: AttachedIOs;
    },
    bluetoothAvailability: {
        isAvailable: boolean;
    }
}

export type AttachedIOModesInformation = {
    capabilities: {
        output: boolean;
        input: boolean;
        logicalCombinable: boolean;
        logicalSynchronizable: boolean;
    };
    totalModeCount: number;
    inputModes: number[];
    outputModes: number[];
}

export type AttachedIOs = {
    [portId in number]: {
        ioType: IOType;
        value: number[],
        modesInformation: AttachedIOModesInformation | null;
    }
}

export enum HubConnectionState {
    NotConnected,
    Connected,
    Connecting,
    Disconnecting
}

export enum ControllerType {
    Unassigned,
    GamePad,
    Keyboard
}

export type ControllerButtonState = {
    readonly index: number;
    readonly value: number;
}

export type ControllerAxisState = {
    readonly index: number;
    readonly value: number;
}

export enum ControllerConnectionState {
    NotConnected,
    Listening,
    Connected
}

export type ControllerAxesState = {
    [index in number]: ControllerAxisState
};

export type ControllerButtonsState = {
    [index in number]: ControllerButtonState
};

export type ControllerState = {
    axes: ControllerAxesState;
    buttons: ControllerButtonsState;
}

export type GamepadButtonConfig = {
    index: number;
    nameL10nKey?: string;
}

export type GamepadButtonAxisConfig = {
    isButton: true;
    buttonIndex: number;
    nameL10nKey?: string;
}

export type GamepadNormalAxisConfig = {
    isButton: false;
    index: number;
    nameL10nKey?: string;
}

export type GamepadAxisConfig = GamepadButtonAxisConfig | GamepadNormalAxisConfig;

export type GamepadControllerConfig = {
    index: number | null;
    id: string;
    nameL10nKey?: string | null;
    axes: Array<GamepadAxisConfig>;
    buttons: Array<GamepadButtonConfig>;
}