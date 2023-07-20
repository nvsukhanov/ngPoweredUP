import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HubIoOperationMode } from '@app/shared';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf, NgIf } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { BindingEditAvailableOperationModesModel } from '../../../control-schemes-feature.selectors';

@Component({
    standalone: true,
    selector: 'app-hub-select',
    templateUrl: './hub-select.component.html',
    styleUrls: [ './hub-select.component.scss' ],
    imports: [
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgIf,
        NgForOf,
        TranslocoModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HubSelectComponent implements OnChanges {
    @Input() public availabilityData: BindingEditAvailableOperationModesModel = {};

    @Input() public control?: FormControl<string>;

    @Input() public operationMode?: HubIoOperationMode;

    private _availableHubs: Array<{ id: string; name: string }> = [];

    public get availableHubs(): Array<{ id: string; name: string }> {
        return this._availableHubs;
    }

    public ngOnChanges(): void {
        if (this.operationMode === undefined) {
            this.control?.reset();
            this._availableHubs = [];
            return;
        }

        this._availableHubs = this.availabilityData[this.operationMode]?.hubs ?? [];

        if (!this.control) {
            return;
        }

        const availableHubs = this.availabilityData[this.operationMode]?.hubs;
        if (!availableHubs || availableHubs.length === 0) {
            this.control.reset();
            return;
        }
        if (this.control && this.control.value !== null && !availableHubs.find((hubData) => hubData.id === this.control?.value)) {
            this.control.setValue(availableHubs[0].id);
        }
    }
}