import Handlebars from "handlebars";
import { ObjectHelper } from "../helpers/ObjectHelper";
import { IComponentDefinition } from "../model/IComponentDefinition";
import { IComponentFieldsConfiguration } from "../model/IComponentFieldsConfiguration";
import { IDataResultType } from "../model/IDataResultType";
import groupBy from 'handlebars-group-by';

export class TemplateService {
    public constructor() {
        this.registerCustomHelpers();
    }

    public registerCustomComponent(name: string, definition: any){
        if(window.customElements.get(name)){
            return;
        }
        window.customElements.define(name, definition);
    }
    /**
   * Registers custom Handlebars helpers in the global context
   */
    public registerCustomHelpers() {
        // Return the search result count message
        // Usage: {{getCountMessage totalRows keywords}} or {{getCountMessage totalRows null}}
        Handlebars.registerHelper("getCountMessage", (totalRows: string, inputQuery?: string) => {

            const countResultMessage = totalRows;
            //inputQuery ? Text.format(strings.HandlebarsHelpers.CountMessageLong, totalRows, inputQuery) : Text.format(strings.HandlebarsHelpers.CountMessageShort, totalRows);
            return new Handlebars.SafeString(countResultMessage);
        });

        Handlebars.registerHelper("JSONstringify", (obj: any) => {
            return JSON.stringify(obj);
        });

        // Return the highlighted summary of the search result item
        // <p>{{getSummary HitHighlightedSummary}}</p>
        Handlebars.registerHelper("getSummary", (hitHighlightedSummary: string) => {
            if (hitHighlightedSummary) {
                return new Handlebars.SafeString(hitHighlightedSummary.replace(/<c0\>/g, "<strong>").replace(/<\/c0\>/g, "</strong>").replace(/<ddd\/>/g, "&#8230;"));
            }
        });

        // Return the formatted date according to current locale using moment.js
        // <p>{{getDate Created "LL"}}</p>
        Handlebars.registerHelper("getDate", ((date: string, format: string, timeHandling?: number, isZ?: boolean) => {
            try {
                if (isZ && !date.toUpperCase().endsWith("Z")) {
                    if (date.indexOf(' ') !== -1) {
                        date += " ";
                    }
                    date += "Z";
                }
                return new Intl.DateTimeFormat().format(new Date(date));
            } catch (error) {
                return date;
            }
        }).bind(this));

        // Return the URL or Title part of a URL automatic managed property
        // <p>{{getUrlField MyLinkOWSURLH "Title"}}</p>
        Handlebars.registerHelper("getUrlField", (urlField: string, value: "URL" | "Title") => {
            if (urlField) {
                let separatorPos = urlField.indexOf(",");
                if (separatorPos === -1) {
                    return urlField;
                }
                if (value === "URL") {
                    return urlField.substr(0, separatorPos);
                }
                return urlField.substr(separatorPos + 1).trim();
            }
            return new Handlebars.SafeString(urlField);
        });

        // Return the unique count based on an array or property of an object in the array
        // <p>{{getUniqueCount items "Title"}}</p>
        Handlebars.registerHelper("getUniqueCount", (array: any[], property: string) => {
            if (!Array.isArray(array)) return 0;
            if (array.length === 0) return 0;

            let result;
            // if (property) {
            //     result = uniqBy(array, property);

            // }
            // else {
            //     result = uniq(array);
            // }
            return result.length;
        });

        // Return the unique values as a new array based on an array or property of an object in the array
        // <p>{{getUnique items "NewsCategory"}}</p>
        Handlebars.registerHelper("getUnique", (array: any[], property: string) => {
            if (!Array.isArray(array)) return 0;
            if (array.length === 0) return 0;

            let result;
            // if (property) {
            //     result = uniqBy(array, property);
            // } else {
            //     result = uniq(array);
            // }
            return result;
        });

        // Repeat the block N times
        // https://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js
        // <p>{{#times 10}}</p>
        Handlebars.registerHelper('times', (n, block) => {
            var accum = '';
            for (var i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        });

        //
        Handlebars.registerHelper("regex", (regx: string, str: string) => {
            let rx = new RegExp(regx);
            let i = rx.exec(str);
            if (!!!i || i.length === 0) return "-";
            let ret: string = i[0];
            return ret;
        });

        // Group by a specific property
        Handlebars.registerHelper(groupBy(Handlebars));

        // Return the value for a specific slot
        Handlebars.registerHelper("slot", (item: any, propertyPath: string) => {
            if (propertyPath) {
                const value = ObjectHelper.byPath(item, propertyPath);
                return value;
            }
        });

        // Match and return an email in the specified expression
        Handlebars.registerHelper("getUserEmail", (expr: string) => {

            if (expr) {

                const matches = expr.match(/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/gi);
                if (matches) {
                    return matches[0]; // Return the full match
                } else {
                    return expr;
                }
            }
        });
    }
}