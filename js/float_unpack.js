import { app } from "../../scripts/app.js";

const ClassName = "FloatUnpack";
const OutputPrefix = "output_";
const NumWidgetName = "value_num";

app.registerExtension({
    name: "A2.FloatUnpack.Dynamic",

    nodeCreated(node) {
        if (node.comfyClass !== ClassName) return;

        const numWidget = getNumWidget(node);
        if (!numWidget) return;

        // Keep original output definitions =====
        const outputDefinitions = node.outputs.map(output => ({
            name: output.name,
            type: output.type,
        }));

        function updateOutputs() {
            if (app.configuringGraph) return;

            const num = getNum(numWidget);

            // Remove excess outputs =====
            for (let i = node.outputs.length - 1; i >= 0; i--) {
                const output = node.outputs[i];

                if (
                    output.name.startsWith(OutputPrefix) &&
                    Number(output.name.slice(OutputPrefix.length)) >= num
                ) {
                    node.removeOutput(i);
                }
            }

            // Add missing outputs =====
            for (let i = 0; i < num; i++) {
                const name = `${OutputPrefix}${i}`;

                if (!node.outputs.some(output => output.name === name)) {
                    const definition = outputDefinitions[i];
                    node.addOutput(name, definition?.type ?? "FLOAT");
                }
            }

            node.setSize(node.computeSize());
            node.setDirtyCanvas(true, true);
        }

        node.updateOutputs = updateOutputs;

        const originalCallback = numWidget.callback;

        numWidget.callback = function(value) {
            originalCallback?.call(this, value);
            updateOutputs();
        };

        updateOutputs();
    },

    afterConfigureGraph(_missingNodeTypes, app) {
        for (const node of app.graph._nodes) {
            if (node.comfyClass === ClassName) {
                node.updateOutputs?.();
            }
        }
    },
});

function getNumWidget(node) {
    return node.widgets?.find(
        w => w.name === NumWidgetName
    );
}

function getNum(numWidget) {
    return Math.max(1, Math.min(100, Math.floor(Number(numWidget?.value ?? 1))));
}