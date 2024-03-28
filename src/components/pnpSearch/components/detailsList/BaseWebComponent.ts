import * as ReactDOM from "react-dom"
import { camelCase } from "../../../../utils/StringUtils";

export abstract class BaseWebComponent extends HTMLElement {

    protected abstract connectedCallback(): void;

    protected disconnectedCallback() {
        ReactDOM.unmountComponentAtNode(this);
    }

    /**
     * Transforms web component attributes to camel case properties to pass in React components
     * (ex: a 'preview-image' HTML attribute becomes 'previewImage' prop, etc.)
     * @returns the properties with formatted names 
     */
    protected resolveAttributes(): { [key: string]: any } {

        let props = {} as any;
        props.webPartId = this.findWebPartId();

        for (let i = 0; i < this.attributes.length; i++) {

            if (this.attributes.item(i)) {

                let value = this.attributes.item(i).value;
                let attr = this.attributes.item(i).name;

                // Resolve 'data-*' attribute name
                const matches = attr.match(/data-(.+)/);
                if (matches && matches.length === 2) {
                    attr = matches[1];
                }

                // If the value is not empty
                if (value) {

                    // Booleans
                    if (/^(true|false)$/.test(value)) {
                        props[camelCase(attr)] = (value === 'true');
                    } else {

                        // Check if the expression is not between quotes (ex: SharePoint refinement tokens). This kind of expression is a valid JSON object for JSON.parse().
                        if (/^(?:'|").*(?:'|")$/.test(value)) {
                            props[camelCase(attr)] = value; // No modification, pass the parameter as a regular string
                        } else {
                            // Objects
                            try {
                                props[camelCase(attr)] = JSON.parse(value);
                            } catch (error) {

                                // Date
                                if (new Date(Date.parse(value)).toString() !== 'Invalid Date') {
                                    props[camelCase(attr)] = new Date(Date.parse(value));
                                } else {
                                    // Return the original value as string
                                    props[camelCase(attr)] = value;
                                }
                            }
                        }
                    }
                }
            }
        }
        return props;
    }

    protected findWebPartId(): string {
        let webPartId = "";
        let parent = this.parentElement;
        while (parent) {
            if (parent.getAttribute("data-webPartId")) {
                webPartId = parent.getAttribute("data-webPartId");
                break;
            }
            parent = parent.parentElement;
        }
        return webPartId;
    }
}