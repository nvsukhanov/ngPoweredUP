import { Observable } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';
import { Injectable } from '@angular/core';
import { ControlSchemeBindingType } from '@app/shared-misc';
import { ControlSchemeBindingInputs, ControlSchemeGearboxControlBinding, ControlSchemeInput, GearboxControlInputAction, PortCommandTask } from '@app/store';

import { IBindingL10n } from '../i-binding-l10n';
import { ControllerInputNameService, DirectionAwareControllerInputNameService } from '../common';

@Injectable()
export class GearboxL10nService implements IBindingL10n<ControlSchemeBindingType.GearboxControl> {
    public readonly bindingTypeL10nKey = 'controlScheme.gearboxControlBinding.operationMode';

    constructor(
        private readonly translocoService: TranslocoService,
        private readonly controllerNameProvider: ControllerInputNameService,
        private readonly directionAwareControllerNameProvider: DirectionAwareControllerInputNameService,
    ) {
    }

    public buildTaskSummary(
        task: PortCommandTask<ControlSchemeBindingType.GearboxControl>
    ): Observable<string> {
        const level = task.payload.initialLevelIndex - task.payload.angleIndex;
        const angle = task.payload.angle;
        const isLooping = task.payload.isLooping;
        return this.translocoService.selectTranslate('controlScheme.gearboxControlBinding.taskSummary', { level, angle, isLooping });
    }

    public getBindingInputName(
        actionType: keyof ControlSchemeGearboxControlBinding['inputs']
    ): Observable<string> {
        switch (actionType) {
            case GearboxControlInputAction.NextGear:
                return this.translocoService.selectTranslate('controlScheme.gearboxControlBinding.prevLevel');
            case GearboxControlInputAction.PrevGear:
                return this.translocoService.selectTranslate('controlScheme.gearboxControlBinding.nextLevel');
            case GearboxControlInputAction.Reset:
                return this.translocoService.selectTranslate('controlScheme.gearboxControlBinding.reset');
        }
    }

    public getControllerInputName(
        actionType: keyof ControlSchemeBindingInputs<ControlSchemeBindingType.GearboxControl>,
        inputConfig: ControlSchemeInput
    ): Observable<string> {
        switch (actionType) {
            case GearboxControlInputAction.NextGear:
            case GearboxControlInputAction.PrevGear:
                return this.directionAwareControllerNameProvider.getFullControllerInputNameData(inputConfig);
            case GearboxControlInputAction.Reset:
                return this.controllerNameProvider.getFullControllerInputNameData(inputConfig);
        }
    }

}
