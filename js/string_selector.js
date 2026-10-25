
import { app } from "../../scripts/app.js";

const ClassName = "StringSelector";
const AddLabel = "+";
const InputPrefix = "input_";
const selectWidgetName = "select"

app.registerExtension({
    name: "A2.StringSelector.Dynamic",

    nodeCreated(node) {
        if (node.comfyClass !== ClassName) return;

        let updating = false;
        node.updateInputs = updateInputs;

        node.getInputs = function() {
            return node.inputs.filter(input => input.name.startsWith(InputPrefix));
        };

        node.getSelectWidgetValues = function() {
            const values = node.getInputs().filter(input => input.label !== AddLabel).map(input => input.label);
            if (values.length) return values;
            return ["0"];
        };

        // convert STRING widget to combo =====
        // imporatant: values using function to get dynamic options, it can affect to front and current view
        const widgetIndex = node.widgets?.findIndex(w => w.name === selectWidgetName) ?? -1;
        let selectWidget = widgetIndex >= 0 ? node.widgets[widgetIndex] : null;

        if (selectWidget && selectWidget.type !== "combo") {
            const value = selectWidget.value;

            node.widgets.splice(widgetIndex, 1);

            selectWidget = node.addWidget(
                "combo",
                selectWidgetName,
                value,
                () => node.setDirtyCanvas(true, true),
                { values: () => node.getSelectWidgetValues() }
            );

            selectWidget.serialize = true;
            node.widgets.splice(node.widgets.indexOf(selectWidget), 1);
            node.widgets.splice(widgetIndex, 0, selectWidget);
        }

        function updateInputs() {
            // configuringGraph is life cycle progress. it block multiple updates.
            if (updating || !node.inputs || app.configuringGraph) return;
            updating = true;

            try {
                function getSourceNode(input) {
                    if (input.link == null || !node.graph) return null;

                    const link = node.graph.links.get(input.link);
                    if (!link) return null;

                    return node.graph.getNodeById(link.origin_id);
                }

                // get string inputs =====
                let inputs = node.getInputs();

                // remove tail not linked inputs ======
                for (let i = inputs.length - 1; i >= 0; i--) {
                    if (inputs[i].link != null) break;

                    node.removeInput(node.inputs.indexOf(inputs[i]));
                }
                // refresh
                inputs = node.getInputs();

                // update name and label =====
                for (let index = 0; index < inputs.length; index++) {
                    const input = inputs[index];

                    // reset name to get value within the node correctly
                    input.name = `${InputPrefix}${index}`;

                    // update label if connected to a "+" input. =====
                    let label = input.name;
                    const sourceNode = getSourceNode(input);
                    if (sourceNode && sourceNode.title) {
                        label = index + ": " + sourceNode.title;
                    }
                    input.label = label;
                }

                // fix select widget value =====
                fixSelectWidgetValue();

                // add a new input at the end with the "+" label =====
                const nextIndex = inputs.length;
                node.addInput(`${InputPrefix}${nextIndex}`, "STRING");

                const lastInput = node.inputs[node.inputs.length - 1];
                lastInput.label = AddLabel;

                // refresh node size and canvas =====
                node.setSize(node.computeSize());
                node.setDirtyCanvas(true, true);
            }
            finally {
                updating = false;
            }

        }

        const original = node.onConnectionsChange;

        node.onConnectionsChange = function(
            type, index, connected, linkInfo
        ) {
            original?.apply(this, arguments);

            if (type === 1) {
                updateInputs();
            }
        };

        // add cleanup button =====
        node.addWidget("button", "Cleanup", null, () => {
            updating = true;
            try {
                // remove all unlinked inputs =====
                const inputs = node.getInputs();

                for (let i = inputs.length - 1; i >= 0; i--) {
                    if (inputs[i].link == null) {
                        node.removeInput(node.inputs.indexOf(inputs[i]));
                    }
                }
            }
            finally {
                updating = false;
            }

            // rebuild inputs =====
            node.updateInputs?.();
        });

        // fix Widget value =====
        function fixSelectWidgetValue() {
            if (!selectWidget) return;

            const value = selectWidget.value;
            const values = node.getSelectWidgetValues();
            selectWidget.value = values.includes(value) ? value : values[0];
        }

        // firstly it is blocked by the app.configuringGraph check. because it run before afterConfigureGraph is called.
        // afterConfigureGraph is called when workflow loading is complete. so first call is in afterConfigureGraph.
        // then it runs when a node is added after workflow loading is complete.
        node.updateInputs?.();
    },
    // Runs after the workflow is loaded, app.configuringGraph is false when running this. (include configuring process) =====
    afterConfigureGraph(_missingNodeTypes, app) {
        for (const node of app.graph._nodes) {
            if (node.comfyClass === ClassName) {
                node.updateInputs?.();
            }
        }
    },
});
