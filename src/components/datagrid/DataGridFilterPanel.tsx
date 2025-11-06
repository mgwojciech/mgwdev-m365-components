import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  makeStyles,
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
}

const useDataGridFilterPanelStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "end"
  },
  button: {},
});

export function DataGridFilterPanel(props: IDataGridFilterPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const classNames = useDataGridFilterPanelStyles();
  return (
    <div className={classNames.root}>
      <Button
        aria-label="Open filter pane"
        icon={<FilterRegular />}
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
      </Drawer>
    </div>
  );
}
