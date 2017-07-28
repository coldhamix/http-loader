import {Injector} from "@angular/core";
import {getTestBed, TestBed} from "@angular/core/testing";
import {HttpClient} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {TranslateHttpPropertiesLoader} from "../index";

describe('TranslateLoader', () => {
    let injector: Injector;
    let translate: TranslateService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: (http: HttpClient) => new TranslateHttpPropertiesLoader(http, '/assets/i18n/', '.properties'),
                        deps: [HttpClient]
                    }
                })
            ],
            providers: [TranslateService]
        });
        injector = getTestBed();
        translate = TestBed.get(TranslateService);
        http = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        injector = undefined;
        translate = undefined;
        http = undefined;
    });

    it('should be able to provide TranslateHttpLoader', () => {
        expect(TranslateHttpPropertiesLoader).toBeDefined();
        expect(translate.currentLoader).toBeDefined();
        expect(translate.currentLoader instanceof TranslateHttpPropertiesLoader).toBeTruthy();
    });

    it('should be able to get translations', () => {
        translate.use('en');

        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('booking.success.startOver').subscribe((res: string) => {
            expect(res).toEqual('Make a new booking');
        });

        // mock response after the xhr request, otherwise it will be undefined
        http.expectOne('/assets/i18n/en.properties').flush("booking.success.message=Your booking has been made. Your job number is {{ jobNumber }}\nbooking.success.startOver=Make a new booking\ncapacity.title=Car capacity\ncapacity.label.passengers=Passengers\ncapacity.label.smallBags=Small bags");

        // this will request the translation from downloaded translations without making a request to the backend
        translate.get('capacity.title').subscribe((res: string) => {
            expect(res).toEqual('Car capacity');
        });
    });
});
