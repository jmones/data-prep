// ============================================================================
//
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

package org.talend.dataprep.transformation.actions.clear;

import static org.hamcrest.CoreMatchers.hasItem;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.transformation.actions.ActionMetadataTestUtils.getColumn;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.Test;
import org.talend.dataprep.api.action.ActionDefinition;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.dataset.row.DataSetRow;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.actions.AbstractMetadataBaseTest;
import org.talend.dataprep.transformation.actions.ActionMetadataTestUtils;
import org.talend.dataprep.transformation.actions.category.ActionCategory;
import org.talend.dataprep.transformation.actions.common.RunnableAction;
import org.talend.dataprep.transformation.api.action.context.ActionContext;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;

/**
 * Test class for ClearInvalid action. Creates one consumer, and test it.
 *
 * @see ClearInvalid
 */
public class ClearInvalidTest extends AbstractMetadataBaseTest {

    /** The action to test. */
    private ClearInvalid clearInvalid = new ClearInvalid();

    private Map<String, String> parameters;

    /**
     * Default constructor.
     */
    public ClearInvalidTest() throws IOException {
        parameters = ActionMetadataTestUtils
                .parseParameters(ClearInvalidTest.class.getResourceAsStream("clearInvalidAction.json"));
    }

    @Test
    public void testName() throws Exception {
        assertThat(clearInvalid.getName(), is("clear_invalid"));
    }

    @Test
    public void testCategory() throws Exception {
        assertThat(clearInvalid.getCategory(), is(ActionCategory.DATA_CLEANSING.getDisplayName()));
    }

    @Test
    public void testActionScope() throws Exception {
        assertThat(clearInvalid.getActionScope(), hasItem("invalid"));
    }

    @Test
    public void should_clear_because_non_valid() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "David Bowie");
        values.put("0001", "N");
        values.put("0002", "Something");

        final DataSetRow row = new DataSetRow(values);
        row.setInvalid("0001");
        final RowMetadata rowMetadata = row.getRowMetadata();
        rowMetadata.getById("0001").setType(Type.STRING.getName());

        final Map<String, Object> expectedValues = new LinkedHashMap<>();
        expectedValues.put("__tdpInvalid", "0001");
        expectedValues.put("0000", "David Bowie");
        expectedValues.put("0001", "");
        expectedValues.put("0002", "Something");

        // when
        final RunnableAction action = factory.create(clearInvalid, parameters);
        final ActionContext context = new ActionContext(new TransformationContext(), rowMetadata);
        context.setParameters(parameters);
        action.getRowAction().apply(row, context);

        // then
        assertEquals(expectedValues, row.values());
    }

    @Test
    public void should_not_clear_because_valid() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "David Bowie");
        values.put("0001", "N");
        values.put("0002", "Something");

        final DataSetRow row = new DataSetRow(values);
        final RowMetadata rowMetadata = row.getRowMetadata();
        rowMetadata.getById("0001").setType(Type.STRING.getName());

        final Map<String, Object> expectedValues = new HashMap<>();
        expectedValues.put("0000", "David Bowie");
        expectedValues.put("0001", "N");
        expectedValues.put("0002", "Something");

        // when
        final RunnableAction action = factory.create(clearInvalid, parameters);
        final ActionContext context = new ActionContext(new TransformationContext(), rowMetadata);
        context.setParameters(parameters);
        action.getRowAction().apply(row, context);

        // then
        assertEquals(expectedValues, row.values());
    }

    @Test
    public void should_not_clear_invalid_date() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0001", "David Bowie");
        values.put("0002", "20-09-1975");
        values.put("0003", "Something");

        final DataSetRow row = new DataSetRow(values);
        final RowMetadata rowMetadata = row.getRowMetadata();
        rowMetadata.getById("0002").setType(Type.DATE.getName());

        final Map<String, Object> expectedValues = new LinkedHashMap<>();
        expectedValues.put("0001", "David Bowie");
        expectedValues.put("0002", "20-09-1975");
        expectedValues.put("0003", "Something");

        // when
        final RunnableAction action = factory.create(clearInvalid, parameters);
        final ActionContext context = new ActionContext(new TransformationContext(), rowMetadata);
        context.setParameters(parameters);
        action.getRowAction().apply(row, context);

        // then
        assertEquals(expectedValues, row.values());
    }


    @Test
    public void should_accept_column() {
        for (Type type : Type.values()) {
            assertTrue(clearInvalid.acceptField(getColumn(type)));
        }
    }

    @Test
    public void should_have_expected_behavior() {
        assertEquals(2, clearInvalid.getBehavior().size());
        assertTrue(clearInvalid.getBehavior().contains(ActionDefinition.Behavior.VALUES_COLUMN));
        assertTrue(clearInvalid.getBehavior().contains(ActionDefinition.Behavior.NEED_STATISTICS_INVALID));
    }

}
