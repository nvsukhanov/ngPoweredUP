import { PortCommandTaskComposer } from '../port-command-task-composer';
import { AttachedIOState, ControlSchemeBinding, HubIoOperationMode } from '../../../store';
import { PortCommandSetAngle, PortCommandTaskType } from '../../../common';

export class SetAngleComposer extends PortCommandTaskComposer {
    private readonly inputValueThreshold = 0.5;

    protected handle(
        binding: ControlSchemeBinding,
        inputValue: number,
        ioState: AttachedIOState,
    ): PortCommandSetAngle | null {
        const outputConfig = binding.output;
        if (outputConfig.operationMode !== HubIoOperationMode.SetAngle || ioState === undefined || ioState.motorEncoderOffset === null) {
            return null;
        }
        if (inputValue < this.inputValueThreshold) {
            return null;
        }
        return {
            taskType: PortCommandTaskType.SetAngle,
            hubId: outputConfig.hubId,
            portId: outputConfig.portId,
            bindingId: binding.id,
            isNeutral: true,
            angle: outputConfig.setAngleConfig.angle,
            speed: outputConfig.setAngleConfig.speed,
            power: outputConfig.setAngleConfig.power,
            endState: outputConfig.setAngleConfig.endState,
            createdAt: Date.now(),
        };
    }
}