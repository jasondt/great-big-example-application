import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Hero } from './hero.model';
import { HeroPopupService } from './hero-popup.service';
import { HeroService } from './hero.service';

@Component({
    selector: 'jhi-hero-dialog',
    templateUrl: './hero-dialog.component.html'
})
export class HeroDialogComponent implements OnInit {

    hero: Hero;
    authorities: any[];
    isSaving: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        private alertService: JhiAlertService,
        private heroService: HeroService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.hero.id !== undefined) {
            this.subscribeToSaveResponse(
                this.heroService.update(this.hero), false);
        } else {
            this.subscribeToSaveResponse(
                this.heroService.create(this.hero), true);
        }
    }

    private subscribeToSaveResponse(result: Observable<Hero>, isCreated: boolean) {
        result.subscribe((res: Hero) =>
            this.onSaveSuccess(res, isCreated), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: Hero, isCreated: boolean) {
        this.alertService.success(
            isCreated ? 'greatBigExampleApplicationApp.hero.created'
            : 'greatBigExampleApplicationApp.hero.updated',
            { param : result.id }, null);

        this.eventManager.broadcast({ name: 'heroListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }
}

@Component({
    selector: 'jhi-hero-popup',
    template: ''
})
export class HeroPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private heroPopupService: HeroPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.modalRef = this.heroPopupService
                    .open(HeroDialogComponent, params['id']);
            } else {
                this.modalRef = this.heroPopupService
                    .open(HeroDialogComponent);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
