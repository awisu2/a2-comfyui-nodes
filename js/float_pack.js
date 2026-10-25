import { app } from "../../scripts/app.js";

const ClassName = "FloatPack";
const ValueWidgetPrefix = "input_";
const NumWidgetName = "value_num";

app.registerExtension({
    name: "A2.FloatPack.Dynamic",

    nodeCreated(node) {
        if (node.comfyClass !== ClassName) return;

        const numWidget = getNumWidget(node);
        if (!numWidget) return;



        function updateInputs() {
            if (app.configuringGraph) return;
            
            const num = getNum(numWidget);

            const valueWidgets = getValueWidgets(node);

            // Remove excess inputs =====
            for (let i = valueWidgets.length - 1; i >= 0; i--) {
                const widget = valueWidgets[i];
                const index = Number(widget.name.slice(ValueWidgetPrefix.length));

                if (index >= num) {
                    node.widgets.splice(node.widgets.indexOf(widget), 1);
                    widget.onRemove?.();
                }
            }

            // Add missing inputs =====
            for (let i = 0; i < num; i++) {
                const name = `${ValueWidgetPrefix}${i}`;

                if (!node.widgets?.some(widget => widget.name === name)) {
                    node.addWidget(
                        "number",
                        name,
                        0.0,
                        () => node.setDirtyCanvas(true, true),
                        {
                            min: -Infinity,
                            max: Infinity,
                            step: 1,
                            precision: 1,
                        }
                    );
                }
            }

            node.setSize(node.computeSize());
            node.setDirtyCanvas(true, true);
        }

        node.updateInputs = updateInputs;

        const originalCallback = numWidget.callback;

        numWidget.callback = function(value) {
            originalCallback?.call(this, value);
            updateInputs();
        };

        updateInputs();
    },

    afterConfigureGraph(_missingNodeTypes, app) {
        for (const node of app.graph._nodes) {
            if (node.comfyClass === ClassName) {
                node.updateInputs?.();
            }
        }
    },
    async setup() {
        const originalGraphToPrompt = app.graphToPrompt;

        app.graphToPrompt = async function(...args) {
            const prompt = await originalGraphToPrompt.apply(this, args);

            for (const node of app.graph._nodes) {
                if (node.comfyClass !== ClassName) continue;

                const promptNode = prompt.output?.[String(node.id)];
                if (!promptNode) continue;

                const num = getNum(getNumWidget(node));

                for (let i = 0; i < num; i++) {
                    const name = `${ValueWidgetPrefix}${i}`;
                    const widget = node.widgets?.find(w => w.name === name);

                    promptNode.inputs[name] = widget?.value ?? 0.0;
                }
            }

            return prompt;
        };
    },
});

function getNumWidget(node) {
    return node.widgets?.find(
        w => w.name === NumWidgetName
    );
}

function getValueWidgets(node) {
    return node.widgets?.filter(
        w => w.name.startsWith(ValueWidgetPrefix)
    );
}

function getNum(numWidget) {
    return Math.max(1, Math.floor(Number(numWidget?.value ?? 1)));
}