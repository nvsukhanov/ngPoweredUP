import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ControlSchemeSetSpeedBinding } from '@app/store';

import { SetSpeedBindingForm } from '../types';
import { CommonFormControlsBuilderService } from './common-form-controls-builder.service';

@Injectable({ providedIn: 'root' })
export class SetSpeedBindingFormBuilderService {
    constructor(
        private readonly formBuilder: FormBuilder,
        private commonFormControlBuilder: CommonFormControlsBuilderService
    ) {
    }

    public build(): SetSpeedBindingForm {
        return this.formBuilder.group({
            id: this.commonFormControlBuilder.schemeIdControl(),
            inputs: this.formBuilder.group({
                accelerate: this.commonFormControlBuilder.inputFormGroup(),
                brake: this.commonFormControlBuilder.optionalInputFormGroup(),
            }),
            hubId: this.commonFormControlBuilder.hubIdControl(),
            portId: this.commonFormControlBuilder.portIdControl(),
            maxSpeed: this.commonFormControlBuilder.speedControl(),
            isToggle: this.commonFormControlBuilder.toggleControl(),
            invert: this.commonFormControlBuilder.toggleControl(),
            power: this.commonFormControlBuilder.powerControl(),
            useAccelerationProfile: this.commonFormControlBuilder.toggleControl(),
            useDecelerationProfile: this.commonFormControlBuilder.toggleControl()
        });
    }

    public patchForm(
        form: SetSpeedBindingForm,
        patch: Partial<ControlSchemeSetSpeedBinding>
    ): void {
        form.patchValue(patch);
    }
}