import React, { useState, memo, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import EditableText, {
  EditInteractionKind,
} from "components/editorComponents/EditableText";
import { updateWidgetName } from "actions/propertyPaneActions";
import { AppState } from "reducers";
import Spinner from "components/editorComponents/Spinner";
import { getExistingWidgetNames } from "sagas/selectors";
import { removeSpecialChars } from "utils/helpers";
import { useToggleEditWidgetName } from "utils/hooks/dragResizeHooks";
import AnalyticsUtil from "utils/AnalyticsUtil";
import PropertyPaneHelpButton from "pages/Editor/PropertyPaneHelpButton";

import { Icon, Tooltip, Position, Classes } from "@blueprintjs/core";
import { WidgetType } from "constants/WidgetConstants";
import { theme } from "constants/DefaultTheme";
import { ControlIcons } from "icons/ControlIcons";
import { FormIcons } from "icons/FormIcons";
import { deleteSelectedWidget, copyWidget } from "actions/widgetActions";

const CopyIcon = ControlIcons.COPY_CONTROL;
const DeleteIcon = FormIcons.DELETE_ICON;
const Wrapper = styled.div`
  justify-content: center;
  align-items: center;
  display: grid;
  width: 100%;
  grid-template-columns: 146px 25px 25px 25px 25px;
  justify-items: center;
  align-items: center;
  justify-content: stretch;
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: ${(props) => props.theme.colors.paneBG};
  & span.${Classes.POPOVER_TARGET} {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NameWrapper = styled.div`
  max-width: 100%;
  display: flex;
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: 126px 20px;
  &&&&&&& > * {
    overflow: hidden;
  }
`;

type PropertyPaneTitleProps = {
  title: string;
  widgetId?: string;
  widgetType?: WidgetType;
  onClose: () => void;
};

/* eslint-disable react/display-name */
const PropertyPaneTitle = memo((props: PropertyPaneTitleProps) => {
  const dispatch = useDispatch();
  const { updating } = useSelector((state: AppState) => ({
    updating: state.ui.editor.loadingStates.updatingWidgetName,
  }));
  const isNew = useSelector((state: AppState) => state.ui.propertyPane.isNew);
  const widgets = useSelector(getExistingWidgetNames);
  const toggleEditWidgetName = useToggleEditWidgetName();
  const [name, setName] = useState(props.title);
  const valueRef = useRef("");

  const updateTitle = useCallback(
    (value?: string) => {
      if (
        value &&
        value.trim().length > 0 &&
        value.trim() !== props.title.trim() &&
        valueRef.current !== value.trim() &&
        props.widgetId
      ) {
        valueRef.current = value.trim();
        if (widgets.indexOf(value.trim()) > -1) {
          setName(props.title);
        }
        dispatch(updateWidgetName(props.widgetId, value.trim()));
      }
    },
    [dispatch, widgets, setName, props.widgetId, props.title],
  );
  useEffect(() => {
    setName(props.title);
  }, [props.title]);

  const handleDelete = useCallback(
    () => dispatch(deleteSelectedWidget(false)),
    [dispatch],
  );
  const handleCopy = useCallback(() => dispatch(copyWidget(false)), [dispatch]);

  const exitEditMode = useCallback(() => {
    props.widgetId && toggleEditWidgetName(props.widgetId, false);
  }, [toggleEditWidgetName, props.widgetId]);

  return props.widgetId ? (
    <Wrapper>
      <NameWrapper>
        <EditableText
          type="text"
          valueTransform={removeSpecialChars}
          defaultValue={name}
          onTextChanged={updateTitle}
          placeholder={props.title}
          updating={updating}
          editInteractionKind={EditInteractionKind.SINGLE}
          isEditingDefault={isNew}
          onBlur={exitEditMode}
          hideEditIcon
          minimal
          className="t--propery-page-title"
          beforeUnmount={updateTitle}
        />
        {updating && <Spinner size={16} />}
      </NameWrapper>
      <Tooltip
        content="Copy Widget"
        position={Position.TOP}
        hoverOpenDelay={200}
      >
        <CopyIcon
          className="t--copy-widget"
          width={14}
          height={14}
          color={theme.colors.paneSectionLabel}
          onClick={handleCopy}
        />
      </Tooltip>
      <Tooltip
        content="Delete Widget"
        position={Position.TOP}
        hoverOpenDelay={200}
      >
        <DeleteIcon
          className="t--delete-widget"
          width={16}
          height={16}
          color={theme.colors.paneSectionLabel}
          onClick={handleDelete}
        />
      </Tooltip>
      <Tooltip
        content={<span>Explore widget related docs</span>}
        position={Position.TOP}
        hoverOpenDelay={200}
        boundary="window"
      >
        <PropertyPaneHelpButton />
      </Tooltip>
      <Tooltip content="Close" position={Position.TOP} hoverOpenDelay={200}>
        <Icon
          onClick={(e: any) => {
            AnalyticsUtil.logEvent("PROPERTY_PANE_CLOSE_CLICK", {
              widgetType: props.widgetType || "",
              widgetId: props.widgetId,
            });
            props.onClose();
            e.preventDefault();
            e.stopPropagation();
          }}
          iconSize={16}
          color={theme.colors.paneSectionLabel}
          icon="cross"
          className={"t--property-pane-close-btn"}
        />
      </Tooltip>
    </Wrapper>
  ) : null;
});

export default PropertyPaneTitle;
