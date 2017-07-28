import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { parse } from './properties-parser';
import 'rxjs/add/operator/map';

export class TranslateHttpPropertiesLoader implements TranslateLoader {
    constructor(private http: HttpClient, private prefix: string = '/assets/i18n/', private suffix: string = '.json') {
    }

    /**
     * Gets the translations from the server
     * @param lang
     * @returns {any}
     */
    public getTranslation(lang: string): any {
        if(this.suffix === '.properties') {
            return this.http
                .get(`${this.prefix}${lang}${this.suffix}`, {responseType: 'text'})
                .map(text => this.convertProps(text));
        } else {
            return this.http.get(`${this.prefix}${lang}${this.suffix}`);
        }
    }

    raise(obj: any): any {
        let inflated: any = {};

        for(let key in obj) {
            if(Object.prototype.hasOwnProperty.call(obj, key)) {

                let item = inflated;
                let splitKey = key.split('.');

                for(let i = 0; i < splitKey.length - 1; i++) {
                    let part = splitKey[i];

                    if(!item[part]) {
                        item[part] = {};
                    }

                    item = item[part];
                }

                let last = splitKey[splitKey.length - 1];
                this.assertNoOverriding(item[last], splitKey.join('.'));
                item[last] = obj[key];
            }
        }

        return inflated;
    }

    assertNoOverriding(obj: any, propName: string) {
        if(typeof obj !== 'undefined') {
            throw new Error('Failed to convert .properties to JSON. ' +
                'Property ' + propName + ' is already assigned or contains nested properties.');
        }
    }

    convertProps(props: string) {
        let flatProps = parse(props);
        return this.raise(flatProps);
    }

}
