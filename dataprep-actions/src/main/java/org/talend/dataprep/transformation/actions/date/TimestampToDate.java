// ============================================================================
// Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
// This source code is available under agreement available at
// https://github.com/Talend/data-prep/blob/master/LICENSE
//
// You should have received a copy of the agreement
// along with this program; if not, write to Talend SA
// 9 rue Pages 92150 Suresnes, France
//
// ============================================================================

package org.talend.dataprep.transformation.actions.date;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.talend.dataprep.api.action.Action;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.dataset.row.DataSetRow;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.i18n.ActionsBundle;
import org.talend.dataprep.parameters.Parameter;
import org.talend.dataprep.transformation.actions.category.ActionCategory;
import org.talend.dataprep.transformation.actions.common.AbstractActionMetadata;
import org.talend.dataprep.transformation.actions.common.ColumnAction;
import org.talend.dataprep.transformation.api.action.context.ActionContext;
import org.talend.dataprep.util.NumericHelper;

@Action(AbstractActionMetadata.ACTION_BEAN_PREFIX + TimestampToDate.ACTION_NAME)
public class TimestampToDate extends AbstractDate implements ColumnAction {

    /**
     * The action name.
     */
    public static final String ACTION_NAME = "timestamp_to_date"; //$NON-NLS-1$

    /**
     * The column appendix.
     */
    private static final String APPENDIX = "_as_date"; //$NON-NLS-1$

    @Override
    public String getName() {
        return ACTION_NAME;
    }

    @Override
    public boolean acceptField(ColumnMetadata column) {
        return Type.INTEGER.equals(Type.get(column.getType()));
    }

    @Override
    public String getCategory() {
        return ActionCategory.DATE.getDisplayName();
    }

    @Override
    public List<Parameter> getParameters() {
        final List<Parameter> parameters = super.getParameters();
        parameters.addAll(getParametersForDatePattern());
        return ActionsBundle.attachToAction(parameters, this);
    }

    @Override
    public void compile(ActionContext context) {
        super.compile(context);
        compileDatePattern(context);
        // create new column and append it after current column
        final String columnId = context.getColumnId();
        final Map<String, String> parameters = context.getParameters();
        final RowMetadata rowMetadata = context.getRowMetadata();
        final ColumnMetadata column = rowMetadata.getById(columnId);
        context.column(column.getName() + APPENDIX, (r) -> {
            final Type type;
            if ("custom".equals(parameters.get(NEW_PATTERN))) {
                // Custom pattern might not be detected as a valid date, create the new column as string for the most
                // permissive type detection.
                type = Type.STRING;
            } else {
                type = Type.DATE;
            }
            final ColumnMetadata c = ColumnMetadata.Builder //
                    .column() //
                    .name(column.getName() + APPENDIX) //
                    .type(type) //
                    .headerSize(column.getHeaderSize()) //
                    .build();
            rowMetadata.insertAfter(columnId, c);
            return c;
        });
    }

    /**
     * @see ColumnAction#applyOnColumn(DataSetRow, ActionContext)
     */
    @Override
    public void applyOnColumn(DataSetRow row, ActionContext context) {
        final String columnId = context.getColumnId();

        // create new column and append it after current column
        final RowMetadata rowMetadata = context.getRowMetadata();
        final ColumnMetadata column = rowMetadata.getById(columnId);
        final String newColumn = context.column(column.getName() + APPENDIX);

        final String value = row.get(columnId);
        row.set(newColumn, getTimeStamp(value, context.<DatePattern> get(COMPILED_DATE_PATTERN).getFormatter()));
    }

    protected String getTimeStamp(String from, DateTimeFormatter dateTimeFormatter) {
        if (!NumericHelper.isBigDecimal(from)) {
            // empty value if the date cannot be parsed
            return StringUtils.EMPTY;
        }
        LocalDateTime date = LocalDateTime.ofEpochSecond(Long.parseLong(from), 0, ZoneOffset.UTC);
        return dateTimeFormatter.format(date);
    }

    @Override
    public Set<Behavior> getBehavior() {
        return EnumSet.of(Behavior.METADATA_CREATE_COLUMNS);
    }

}
