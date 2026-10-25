
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

        function updateInputs() {
            // configuringGraph is life cycle progress. it block multiple updates.
            if (updating || !node.inputs || app.configuringGraph) return;
            updating = true;

            try {
                function getSourceNode(input) {
                    if (input.link == null) return null;
                    const link = node.graph.links.get(input.link);
                    if (!link) return null;
                    const sourceNode = node.graph.getNodeById(link.origin_id);
                    return sourceNode;
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


                // update index max based on input count =====
                const selectWidget = node.widgets?.find(w => w.name === selectWidgetName);

                if (selectWidget) {
                    // update display name =====
                    updateSelectWidgetLabel();
                }

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

        // update index label when its value changes =====
        const selectWidget = node.widgets?.find(w => w.name === selectWidgetName);
        if (selectWidget) {
            // get default callback
            const _callback = selectWidget.callback;
            selectWidget.callback = function(value) {
                _callback?.call(this, value);
                updateSelectWidgetLabel();
            };
        }

        // update select display label based on selected input =====
        function updateSelectWidgetLabel() {
            if (!selectWidget) return;

            const value = selectWidget.value;

            let options = node.getInputs()?.map(input => input.label)
            if (!options || options.length === 0) {
                options = ["0"];
            }

            selectWidget.options.values = options;
            selectWidget.value = options.includes(value) ? value : options[0];
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
