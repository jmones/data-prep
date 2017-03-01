package org.talend.dataprep.transformation.api.action.metadata;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.preparation.Action;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.metadata.category.ActionCategory;
import org.talend.dataprep.transformation.api.action.metadata.common.SingleColumnAction;
import org.talend.dataprep.transformation.api.action.parameters.Parameter;

import java.util.Map;

import static org.talend.dataprep.api.preparation.Action.Builder.builder;

@Component(Cut.ACTION_BEAN_PREFIX + Cut.CUT_ACTION_NAME)
public class Cut extends SingleColumnAction {

    /**
     * The action name.
     */
    public static final String CUT_ACTION_NAME = "cut"; //$NON-NLS-1$

    public static final String PATTERN_PARAMETER = "pattern"; //$NON-NLS-1$

    /**
     * @see ActionMetadata#getName()
     */
    @Override
    public String getName() {
        return CUT_ACTION_NAME;
    }

    /**
     * @see ActionMetadata#getCategory()
     */
    @Override
    public String getCategory() {
        return ActionCategory.QUICKFIX.getDisplayName();
    }

    /**
     * @see ActionMetadata#getParameters()
     */
    @Override
    public Parameter[] getParameters() {
        return new Parameter[]{COLUMN_ID_PARAMETER, COLUMN_NAME_PARAMETER,
                new Parameter(PATTERN_PARAMETER, Type.STRING.getName(), StringUtils.EMPTY)};
    }

    /**
     * @see ActionMetadata#create(Map)
     */
    @Override
    public Action create(Map<String, String> parameters) {
        return builder().withRow((row, context) -> {
            String columnName = parameters.get(COLUMN_ID);
            String value = row.get(columnName);
            if (value != null) {
                row.set(columnName, value.replace(parameters.get(PATTERN_PARAMETER), "")); //$NON-NLS-1$
            }
            return row;
        }).build();
    }

    /**
     * @see ActionMetadata#accept(ColumnMetadata)
     */
    @Override
    public boolean accept(ColumnMetadata column) {
        return Type.STRING.equals(Type.get(column.getType()));
    }
}