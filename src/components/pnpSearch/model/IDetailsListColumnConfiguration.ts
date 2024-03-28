export interface IDetailsListColumnConfiguration {

    /**
     * The name of the column
     */
    name: string;
  
    /**
     * The value of the column
     */
    value: string;
  
    /**
     * Indicates if the value is an Handlebars expression
     */
    useHandlebarsExpr: boolean;
  
    /**
     * Column maximum width in px
     */
    maxWidth: string;
  
    /**
     * Column minimum width in px
     */
    minWidth: string;
  
    /**
     * Enable sorting on the column
     */
    enableSorting: boolean;
  
    /**
     * Enable column dynamic resize
     */
    isResizable: boolean;
  
    /**
     * Enable multiline column
     */
    isMultiline: boolean;
  }