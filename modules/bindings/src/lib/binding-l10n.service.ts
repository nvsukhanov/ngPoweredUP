import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBindingControllerInputNameResolver } from '@app/shared-control-schemes';
import { IBindingInputNameResolver, IPortCommandTaskSummaryBuilder } from '@app/control-scheme-view';
import { ControlSchemeBinding, ControlSchemeBindingInputs, ControlSchemeInput, PortCommandTask } from '@app/store';
import { ControlSchemeBindingType } from '@app/shared-misc';

import { IBindingL10n } from './i-binding-l10n';
import { GearboxL10nService } from './gearbox';
import { ServoL10nService } from './servo';
import { SetAngleL10nService } from './set-angle';
import { SetSpeedL10nService } from './set-speed';
import { StepperL10nService } from './stepper';
import { TrainControlL10nService } from './train-control';

@Injectable()
export class BindingL10nService implements IBindingControllerInputNameResolver, IBindingInputNameResolver, IPortCommandTaskSummaryBuilder {
    private readonly bindingL10nServices: { [k in ControlSchemeBindingType]: IBindingL10n<k> } = {
        [ControlSchemeBindingType.GearboxControl]: this.gearboxL10nService,
        [ControlSchemeBindingType.Servo]: this.servoL10nService,
        [ControlSchemeBindingType.SetAngle]: this.setAngleL10nService,
        [ControlSchemeBindingType.SetSpeed]: this.setSpeedL10nService,
        [ControlSchemeBindingType.Stepper]: this.stepperL10nService,
        [ControlSchemeBindingType.TrainControl]: this.trainL10nService
    };

    constructor(
        private readonly gearboxL10nService: GearboxL10nService,
        private readonly servoL10nService: ServoL10nService,
        private readonly setAngleL10nService: SetAngleL10nService,
        private readonly setSpeedL10nService: SetSpeedL10nService,
        private readonly stepperL10nService: StepperL10nService,
        private readonly trainL10nService: TrainControlL10nService
    ) {
    }

    public buildTaskSummary<T extends ControlSchemeBindingType>(
        portCommandTask: PortCommandTask<T>
    ): Observable<string> {
        return this.getL10nService(portCommandTask.payload.bindingType).buildTaskSummary(portCommandTask);
    }

    public getBindingInputName<T extends ControlSchemeBinding>(
        binding: T,
        action: keyof T['inputs']
    ): Observable<string> {
        const p = this.getL10nService(binding.bindingType);
        return p.getBindingInputName(action as keyof ControlSchemeBindingInputs, binding);
    }

    public getControllerInputName<T extends ControlSchemeBindingType>(
        bindingType: T,
        actionType: keyof ControlSchemeBindingInputs<T>,
        data: ControlSchemeInput
    ): Observable<string> {
        return this.getL10nService(bindingType).getControllerInputName(actionType, data);
    }

    private getL10nService<T extends ControlSchemeBindingType>(
        bindingType: T
    ): IBindingL10n<T> {
        return this.bindingL10nServices[bindingType];
    }
}