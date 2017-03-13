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

package org.talend.dataprep.transformation.actions.text;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;
import static org.talend.dataprep.api.dataset.ColumnMetadata.Builder.*;
import static org.talend.dataprep.transformation.actions.ActionMetadataTestUtils.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.talend.dataprep.api.action.ActionDefinition;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.row.DataSetRow;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.actions.AbstractMetadataBaseTest;
import org.talend.dataprep.transformation.actions.ActionMetadataTestUtils;
import org.talend.dataprep.transformation.actions.category.ActionCategory;
import org.talend.dataprep.transformation.actions.common.ImplicitParameters;
import org.talend.dataprep.transformation.api.action.ActionTestWorkbench;

/**
 * Test class for Trim action. Creates one consumer, and test it.
 *
 * @see Trim
 */
public class TrimTest extends AbstractMetadataBaseTest {

    /** The action to test. */
    private Trim action = new Trim();

    private Map<String, String> parameters;

    @Before
    public void init() throws IOException {
        parameters = ActionMetadataTestUtils.parseParameters(TrimTest.class.getResourceAsStream("trimAction.json"));
    }

    @Test
    public void testAdapt() throws Exception {
        assertThat(action.adapt((ColumnMetadata) null), is(action));
        ColumnMetadata column = column().name("myColumn").id(0).type(Type.STRING).build();
        assertThat(action.adapt(column), is(action));
    }

    @Test
    public void testCategory() throws Exception {
        assertThat(action.getCategory(), is(ActionCategory.STRINGS.getDisplayName()));
    }

    @Test
    public void should_remove_whiteSpace_value() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", " the beatles ");
        final DataSetRow row = new DataSetRow(values);

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        assertEquals("the beatles", row.get("0000"));
    }

    @Test
    public void should_not_change_a_trimed_value() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "The  Beatles");
        final DataSetRow row = new DataSetRow(values);

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        assertEquals("The  Beatles", row.get("0000"));
    }

    @Test
    public void should_not_change_other_column_values() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "the beatles");
        final DataSetRow row = new DataSetRow(values);

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        assertEquals("the beatles", row.get("0000"));
    }

    @Test
    public void should_remove_tab_value() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "\t" + " the beatles " + "\t"); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$
        final DataSetRow row = new DataSetRow(values);

        parameters = new HashMap<>();
        parameters.put(ImplicitParameters.SCOPE.getKey().toLowerCase(), "column"); //$NON-NLS-1$
        parameters.put(ImplicitParameters.COLUMN_ID.getKey().toLowerCase(), "0000"); //$NON-NLS-1$
        parameters.put(Trim.PADDING_CHAR_PARAMETER, "whitespace"); //$NON-NLS-1$

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        assertEquals("the beatles", row.get("0000")); //$NON-NLS-1$ //$NON-NLS-2$
    }

    @Test
    public void should_remove_other_value() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", " the beatles " + '\u2028'+""); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
        final DataSetRow row = new DataSetRow(values);

        parameters = new HashMap<>();
        parameters.put(ImplicitParameters.SCOPE.getKey().toLowerCase(), "column"); //$NON-NLS-1$
        parameters.put(ImplicitParameters.COLUMN_ID.getKey().toLowerCase(), "0000"); //$NON-NLS-1$
        parameters.put(Trim.PADDING_CHAR_PARAMETER, "whitespace"); //$NON-NLS-1$

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        assertEquals("the beatles", row.get("0000")); //$NON-NLS-1$ //$NON-NLS-2$
    }

    @Test
    public void should_remove_custom_value() {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0000", "the beatles"); //$NON-NLS-1$ //$NON-NLS-2$ 
        final DataSetRow row = new DataSetRow(values);

        parameters = new HashMap<>();
        parameters.put(ImplicitParameters.SCOPE.getKey().toLowerCase(), "column"); //$NON-NLS-1$
        parameters.put(ImplicitParameters.COLUMN_ID.getKey().toLowerCase(), "0000"); //$NON-NLS-1$
        parameters.put(Trim.PADDING_CHAR_PARAMETER, Trim.CUSTOM);
        parameters.put(Trim.CUSTOM_PADDING_CHAR_PARAMETER, "s"); //$NON-NLS-1$

        // when
        ActionTestWorkbench.test(row, actionRegistry, factory.create(action, parameters));

        // then
        assertEquals("the beatle", row.get("0000")); //$NON-NLS-1$ //$NON-NLS-2$
    }

    @Test
    public void should_accept_column() {
        assertTrue(action.acceptField(getColumn(Type.STRING)));
    }

    @Test
    public void should_not_accept_column() {
        assertFalse(action.acceptField(getColumn(Type.NUMERIC)));
        assertFalse(action.acceptField(getColumn(Type.FLOAT)));
        assertFalse(action.acceptField(getColumn(Type.DATE)));
        assertFalse(action.acceptField(getColumn(Type.BOOLEAN)));
    }

    @Test
    public void should_have_expected_behavior() {
        assertEquals(1, action.getBehavior().size());
        assertTrue(action.getBehavior().contains(ActionDefinition.Behavior.VALUES_COLUMN));
    }

}
