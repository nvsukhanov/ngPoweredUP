import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@ngneat/transloco';
import { MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TiltGaugeComponent, TiltGaugeIconDirective, WidgetComponent } from '@app/shared-ui';

@Component({
    standalone: true,
    selector: 'lib-roll-sensor-widget',
    templateUrl: './roll-widget.component.html',
    styleUrls: [ './roll-widget.component.scss' ],
    imports: [
        WidgetComponent,
        TiltGaugeIconDirective,
        MatButtonModule,
        TranslocoPipe,
        TiltGaugeComponent,
        MatMenuItem,
        MatIcon
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RollWidgetComponent {
    @Input() public roll: number | null = null;

    @Input() public title = '';

    @Input() public canBeDeleted = false;

    @Input() public canBeEdited = false;

    @Output() public readonly edit = new EventEmitter<void>();

    @Output() public readonly delete = new EventEmitter<void>();

    @Output() public readonly compensate = new EventEmitter<number>();

    @Output() public readonly resetCompensation = new EventEmitter<void>();

    public onCompensate(): void {
        if (this.roll !== null) {
            this.compensate.emit(this.roll);
        }
    }

    public onResetCompensation(): void {
        this.resetCompensation.emit();
    }

    public onEdit(): void {
        this.edit.emit();
    }

    public onDelete(): void {
        this.delete.emit();
    }
}
