//  ============================================================================
//
//  Copyright (C) 2006-2016 Talend Inc. - www.talend.com
//
//  This source code is available under agreement available at
//  https://github.com/Talend/data-prep/blob/master/LICENSE
//
//  You should have received a copy of the agreement
//  along with this program; if not, write to Talend SA
//  9 rue Pages 92150 Suresnes, France
//
//  ============================================================================

package org.talend.dataprep.transformation.actions.fillinvalid;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.transformation.actions.ActionMetadataTestUtils.getColumn;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.junit.Test;
import org.talend.dataprep.api.action.ActionDefinition;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.dataset.row.DataSetRow;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.actions.AbstractMetadataBaseTest;
import org.talend.dataprep.transformation.actions.ActionMetadataTestUtils;
import org.talend.dataprep.transformation.actions.common.ImplicitParameters;
import org.talend.dataprep.transformation.actions.common.RunnableAction;
import org.talend.dataprep.transformation.actions.fill.FillInvalid;
import org.talend.dataprep.transformation.api.action.context.ActionContext;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;

/**
 * Unit test for FillWithBooleanIfInvalid action.
 *
 * @see FillInvalid
 */
public class FillWithBooleanIfInvalidTest extends AbstractMetadataBaseTest {

    /** The action to test. */
    private FillInvalid fillInvalid = new FillInvalid();

    @PostConstruct
    public void init() {
        fillInvalid = (FillInvalid) fillInvalid.adapt(ColumnMetadata.Builder.column().type(Type.BOOLEAN).build());
    }

    @Test
    public void should_fill_non_valid_boolean() throws Exception {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "David Bowie");
        values.put("0001", "N");
        values.put("0002", "100"); // invalid boolean

        final DataSetRow row = new DataSetRow(values);
        row.setInvalid("0002");
        final RowMetadata rowMetadata = row.getRowMetadata();
        rowMetadata.getById("0002").setType(Type.BOOLEAN.getName());

        Map<String, String> parameters = ActionMetadataTestUtils
                .parseParameters(this.getClass().getResourceAsStream("fillInvalidBooleanAction.json"));
        parameters.put(ImplicitParameters.COLUMN_ID.getKey().toLowerCase(), "0002");

        // when
        final RunnableAction action = factory.create(fillInvalid, parameters);
        final ActionContext context = new ActionContext(new TransformationContext(), rowMetadata);
        context.setParameters(parameters);
        action.getRowAction().apply(row, context);

        // then
        assertEquals("True", row.get("0002"));
        assertEquals("David Bowie", row.get("0000"));
    }

    @Test
    public void should_not_fill_non_valid_boolean() throws Exception {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "David Bowie");
        values.put("0001", "N");
        values.put("0002", "False");

        final DataSetRow row = new DataSetRow(values);
        final RowMetadata rowMetadata = row.getRowMetadata();
        rowMetadata.getById("0002").setType(Type.BOOLEAN.getName());

        Map<String, String> parameters = ActionMetadataTestUtils
                .parseParameters(this.getClass().getResourceAsStream("fillInvalidBooleanAction.json"));
        parameters.put(ImplicitParameters.COLUMN_ID.getKey().toLowerCase(), "0002");

        // when
        final RunnableAction action = factory.create(fillInvalid, parameters);
        final ActionContext context = new ActionContext(new TransformationContext(), rowMetadata);
        context.setParameters(parameters);
        action.getRowAction().apply(row, context);

        // then
        assertEquals("False", row.get("0002"));
        assertEquals("David Bowie", row.get("0000"));
    }

    @Test
    public void should_accept_column() {
        assertTrue(fillInvalid.acceptField(getColumn(Type.BOOLEAN)));
    }

    @Test
    public void should_adapt_null() throws Exception {
        assertThat(fillInvalid.adapt((ColumnMetadata) null), is(fillInvalid));
    }

    @Test
    public void should_not_accept_column() {
        assertFalse(fillInvalid.acceptField(getColumn(Type.ANY)));
    }

    @Test
    public void should_have_expected_behavior() {
        assertEquals(2, fillInvalid.getBehavior().size());
        assertTrue(fillInvalid.getBehavior().contains(ActionDefinition.Behavior.NEED_STATISTICS_INVALID));
        assertTrue(fillInvalid.getBehavior().contains(ActionDefinition.Behavior.VALUES_COLUMN));
    }

}
