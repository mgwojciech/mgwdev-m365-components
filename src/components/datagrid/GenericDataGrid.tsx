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
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  SelectionItemId,
  Spinner,
  TableRowId,
  Text,
  tokens,
} from "@fluentui/react-components";
import {
  ChevronLeft16Regular,
  ChevronRight16Regular,
} from "@fluentui/react-icons";
import { DataGridFilterPanel } from "./DataGridFilterPanel";
import { IQueryField } from "mgwdev-m365-helpers";
import { IQueryFieldWithJoinBy } from "../..";

export type DataGridSelectionMode = "single" | "multiselect";

export interface IGenericDataGridProps<T> {
  dataService: IDataGridService<T>;
  fieldsToRender: DataField[];
  customRenderers?: IColumnRenderer[];
  systemFilter?: IQueryFieldWithJoinBy[];
  selectionMode?: DataGridSelectionMode;
  rowLimit?: number;
  getRowId?: (item: T) => string;
  onSelectionChange?: (selectedItems: T[]) => void;
  renderFilter?: (
    field: DataField,
    onFilterSet: (field: DataField, queryFields: IQueryField[]) => void,
    initialQueryFields?: IQueryField[]
  ) => React.ReactElement;
  onDataFetched?: (items: T[], count: number) => void;
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
  errorWrapper: {
    marginBottom: tokens.spacingVerticalM,
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
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<IQueryField[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<Set<SelectionItemId>>(
    new Set()
  );
  const isNextPageAvailable = React.useMemo(
    () => props.dataService.isNextPageAvailable(),
    [props.dataService, items]);
  const isPreviousPageAvailable = React.useMemo(
    () => props.dataService.isPreviousPageAvailable(),
    [props.dataService, items]
  );

  const getRowIdForItem = React.useCallback(
    (item: T, index: number): TableRowId => {
      if (props.getRowId) {
        return props.getRowId(item);
      }
      // Fallback: try common id properties
      const itemAny = item as Record<string, unknown>;
      if (itemAny["id"]) return String(itemAny["id"]);
      if (itemAny["Id"]) return String(itemAny["Id"]);
      if (itemAny["ID"]) return String(itemAny["ID"]);
      return index;
    },
    [props.getRowId]
  );

  const itemsByRowId = React.useMemo(() => {
    const map = new Map<TableRowId, T>();
    items.forEach((item, index) => {
      map.set(getRowIdForItem(item, index), item);
    });
    return map;
  }, [items, getRowIdForItem]);

  const onSelectionChange: DataGridProps["onSelectionChange"] = (
    e,
    data
  ) => {
    setSelectedRows(data.selectedItems);
    if (props.onSelectionChange) {
      const selectedItems: T[] = [];
      data.selectedItems.forEach((id) => {
        const item = itemsByRowId.get(id);
        if (item) {
          selectedItems.push(item);
        }
      });
      props.onSelectionChange(selectedItems);
    }
  };

  const filterableFields = React.useMemo(
    () => props.fieldsToRender.filter((f) => !f.disableFiltering),
    [props.fieldsToRender]
  );

  const clearFilters = React.useCallback(() => {
    setFilters([]);
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
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
      .then((d) => {
        setItems(d);
        if (props.onDataFetched) {
          props.onDataFetched([], props.dataService.getTotalRows());
        }
      })
      .catch((err) => {
        setError(err?.message || "An error occurred while loading data");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [props.systemFilter, sortState, filters]);

  return (
    <div className={classNames.root}>
      {loading && (
        <div className={classNames.loadingWrapper}>
          <Spinner size="huge" />
        </div>
      )}
      {error && (
        <div className={classNames.errorWrapper}>
          <MessageBar intent="error">
            <MessageBarBody>
              <MessageBarTitle>Error</MessageBarTitle>
              {error}
            </MessageBarBody>
          </MessageBar>
        </div>
      )}
      {props.renderFilter && (
        <DataGridFilterPanel
          filterFields={filterableFields}
          initialQueryFields={filters}
          onFilterSet={(field: DataField, queryFields: IQueryField[]) => {
            const newFilters = [
              ...filters.filter((f) => f.name !== field.name),
            ];
            if (queryFields && queryFields.length > 0) {
              newFilters.push(...queryFields);
            }
            setFilters(newFilters);
          }}
          onClearFilters={clearFilters}
          renderFilter={props.renderFilter}
        />
      )}
      <DataGrid
        items={items}
        columns={tableColumns}
        sortable
        sortState={sortState}
        onSortChange={onSortChange}
        selectionMode={props.selectionMode}
        selectedItems={selectedRows}
        onSelectionChange={onSelectionChange}
        getRowId={(item) => getRowIdForItem(item, items.indexOf(item))}
      >
        <DataGridHeader>
          <DataGridRow
            selectionCell={
              props.selectionMode === "multiselect"
                ? { checkboxIndicator: { "aria-label": "Select all rows" } }
                : undefined
            }
          >
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<T>>
          {({ item, rowId }) => (
            <DataGridRow<T>
              key={rowId}
              selectionCell={
                props.selectionMode
                  ? {
                    checkboxIndicator: { "aria-label": "Select row" },
                    radioIndicator: { "aria-label": "Select row" },
                  }
                  : undefined
              }
            >
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
          disabled={!isPreviousPageAvailable}
          onClick={() => {
            props.dataService
              .getPreviousPage()
              .then((d) => setItems(d))
              .finally(() => setLoading(false));
          }}
          aria-label="Previous page"
          data-testid="datagrid-prev-page"
        >

        </Button>
        <Button
          icon={<ChevronRight16Regular />}
          disabled={!isNextPageAvailable}
          onClick={() => {
            props.dataService
              .getNextPage()
              .then((d) => setItems(d))
              .finally(() => setLoading(false));
          }}
          aria-label="Next page"
          data-testid="datagrid-next-page"
        >
        </Button>
      </div>
    </div>
  );
}
