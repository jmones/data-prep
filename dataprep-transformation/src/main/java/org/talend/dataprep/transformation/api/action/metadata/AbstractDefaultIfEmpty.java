package org.talend.dataprep.transformation.api.action.metadata;

import java.util.Map;
import java.util.function.Consumer;

import org.talend.dataprep.api.dataset.DataSetRow;

public abstract class AbstractDefaultIfEmpty extends SingleColumnAction {

    public static final String DEFAULT_VALUE_PARAMETER = "default_value"; //$NON-NLS-1$

    @Override
    public String getCategory() {
        return "repair";
    }

    @Override
    public Consumer<DataSetRow> create(Map<String, String> parsedParameters) {
        return row -> {
            String columnName = parsedParameters.get(COLUMN_NAME_PARAMETER_NAME);
            String value = row.get(columnName);
            if (value == null || value.trim().length() == 0) {
                row.set(columnName, parsedParameters.get(DEFAULT_VALUE_PARAMETER));
            }
        };
    }
}
