import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { HintComponent, TitleService } from '@app/shared';

@Component({
    standalone: true,
    selector: 'feat-not-found-page',
    templateUrl: './not-found.component.html',
    styleUrls: [ './not-found.component.scss' ],
    imports: [
        TranslocoPipe,
        HintComponent
    ],
    providers: [
        TitleService
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent implements OnInit {
    constructor(
        private readonly titleService: TitleService,
        private readonly translocoService: TranslocoService
    ) {
    }

    public ngOnInit(): void {
        this.titleService.setTitle$(this.translocoService.selectTranslate('pageTitle.notFound'));
    }
}