import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular, FilterRegular } from "@fluentui/react-icons";
import * as React from "react";
import { DataField } from "../../model/DataField";
import { IQueryField } from "mgwdev-m365-helpers/lib/model";

export interface IDataGridFilterPanelProps {
  renderFilter: (
    field: DataField,
    onFilterSet: (field: DataField, queryFields: IQueryField[]) => void,
    initialQueryFields?: IQueryField[]
  ) => React.ReactElement;
  filterFields: DataField[];
  initialQueryFields?: IQueryField[];
  onFilterSet: (field: DataField, queryFields: IQueryField[]) => void;
  onClearFilters?: () => void;
}

const useDataGridFilterPanelStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "end",
    gap: tokens.spacingHorizontalS,
  },
  button: {},
  activeFilterButton: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

export function DataGridFilterPanel(props: IDataGridFilterPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const classNames = useDataGridFilterPanelStyles();
  const hasActiveFilters = props.initialQueryFields && props.initialQueryFields.length > 0;
  
  return (
    <div className={classNames.root}>
      {hasActiveFilters && props.onClearFilters && (
        <Button
          aria-label="Clear all filters"
          appearance="subtle"
          onClick={props.onClearFilters}
        >
          Clear filters
        </Button>
      )}
      <Button
        aria-label="Open filter pane"
        icon={<FilterRegular />}
        className={hasActiveFilters ? classNames.activeFilterButton : undefined}
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <Drawer
        type="overlay"
        separator
        open={isOpen}
        onOpenChange={(_, { open }) => setIsOpen(open)}
        position="end"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setIsOpen(false)}
              />
            }
          >
            Filter
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {props.filterFields.map((fld) => (
            <Field key={fld.name} label={fld.label || fld.name}>
              {props.renderFilter(
                fld,
                props.onFilterSet,
                props.initialQueryFields
              )}
            </Field>
          ))}
        </DrawerBody>
        {hasActiveFilters && props.onClearFilters && (
          <DrawerFooter>
            <Button
              appearance="secondary"
              onClick={() => {
                props.onClearFilters?.();
                setIsOpen(false);
              }}
            >
              Clear all filters
            </Button>
          </DrawerFooter>
        )}
      </Drawer>
    </div>
  );
}