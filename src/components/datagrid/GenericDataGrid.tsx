import * as React from "react";
import { IDataGridService } from "../../services/datagrid/DataGridService";
import { DataField } from "../../model/DataField";
import { IColumnRenderer } from "./columnRenderers/IColumnRenderer";
import { ComposedRenderer } from "./columnRenderers/ComposedRenderer";
import {
  Button,
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridProps,
  DataGridRow,
  makeStyles,
  Spinner,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronLeft16Regular,
  ChevronRight16Regular,
} from "@fluentui/react-icons";
import { DataGridFilterPanel } from "./DataGridFilterPanel";
import { IQueryField } from "mgwdev-m365-helpers";

export interface IGenericDataGridProps<T> {
  dataService: IDataGridService<T>;
  fieldsToRender: DataField[];
  customRenderers?: IColumnRenderer[];
  systemFilter?: IQueryField[];
  renderFilter?: (
    field: DataField,
    onFilterSet: (field: DataField, queryFields: IQueryField[]) => void,
    initialQueryFields?: IQueryField[]
  ) => React.ReactElement;
}

const useGenericDataGridStyles = makeStyles({
  root: {
    position: "relative",
  },
  loadingWrapper: {
    position: "absolute",
    width: "100%",
    height: "min-content",
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
    zIndex: 9999,
  },
  pagination: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalM,
  },
});

export function GenericDataGrid<T>(props: IGenericDataGridProps<T>) {
  const classNames = useGenericDataGridStyles();
  const renderer = React.useMemo(() => {
    const temp = new ComposedRenderer();
    if (props.customRenderers) {
      for (const customRenderer of props.customRenderers) {
        temp.registerRenderer(customRenderer);
      }
    }
    return temp;
  }, [props.customRenderers]);
  const tableColumns = React.useMemo(() => {
    return props.fieldsToRender.map((field) =>
      createTableColumn<T>({
        columnId: field.name,
        renderHeaderCell: () => (
          <Text weight="semibold">{field.label || field.name}</Text>
        ),
        renderCell: (item: T) =>
          renderer.renderField(field, item[field.name], item),
        compare: (a: T, b: T) => a[field.name] - b[field.name],
      })
    );
  }, [props.fieldsToRender]);
  const [sortState, setSortState] = React.useState<
    Parameters<NonNullable<DataGridProps["onSortChange"]>>[1]
  >({
    sortColumn: props.fieldsToRender.find((f) => !f.disableSorting)?.name,
    sortDirection: "ascending",
  });
  const onSortChange: DataGridProps["onSortChange"] = (e, nextSortState) => {
    setSortState(nextSortState);
  };

  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<IQueryField[]>([]);

  React.useEffect(() => {
    setLoading(true);
    props.dataService.setFields(props.fieldsToRender);
    const queryFilters: IQueryField[] = [];
    if (props.systemFilter && props.systemFilter.length > 0) {
      queryFilters.push(...props.systemFilter);
    }
    if (filters && filters.length > 0) {
      queryFilters.push(...filters);
    }
    props.dataService
      .getData(
        queryFilters,
        sortState?.sortColumn?.toString(),
        sortState?.sortDirection == "ascending" ? "ASC" : "DESC"
      )
      .then((d) => setItems(d))
      .finally(() => setLoading(false));
  }, [props.systemFilter, sortState, filters]);

  return (
    <div className={classNames.root}>
      {loading && (
        <div className={classNames.loadingWrapper}>
          <Spinner size="huge" />
        </div>
      )}
      {props.renderFilter && (
        <DataGridFilterPanel
          filterFields={props.fieldsToRender}
          onFilterSet={(field: DataField, queryFields: IQueryField[]) => {
            const newFilters = [
              ...filters.filter((f) => f.name !== field.name),
            ];
            if (queryFields && queryFields.length > 0) {
              newFilters.push(...queryFields);
            }
            setFilters(newFilters);
          }}
          renderFilter={props.renderFilter}
        />
      )}
      <DataGrid
        items={items}
        columns={tableColumns}
        sortable
        sortState={sortState}
        onSortChange={onSortChange}
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<T>>
          {({ item, rowId }) => (
            <DataGridRow<T> key={rowId}>
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
      <div className={classNames.pagination}>
        <Button
          icon={<ChevronLeft16Regular />}
          disabled={!props.dataService.isPreviousPageAvailable()}
          onClick={() => {
            props.dataService
              .getPreviousPage()
              .then((d) => setItems(d))
              .finally(() => setLoading(false));
          }}
          aria-label="Previous page"
        >
          
        </Button>
        <Button
          icon={<ChevronRight16Regular />}
          disabled={!props.dataService.isNextPageAvailable()}
          onClick={() => {
            props.dataService
              .getNextPage()
              .then((d) => setItems(d))
              .finally(() => setLoading(false));
          }}
          aria-label="Next page"
        >
        </Button>
      </div>
    </div>
  );
}
