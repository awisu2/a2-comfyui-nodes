
import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "A2.RandomNumber.Display",

    beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "RandomNumber") return;

        const originalOnExecuted = nodeType.prototype.onExecuted;
        const widgetName = "result";

        nodeType.prototype.onExecuted = function(message) {
            originalOnExecuted?.apply(this, arguments);

            const value = message?.text?.[0];
            if (value === undefined) return;

            let widget = this.widgets?.find(
                w => w.name === widgetName
            );

            if (!widget) {
                widget = this.addWidget(
                    "text",
                    widgetName,
                    String(value),
                    () => {},
                    { serialize: false }
                );
            } else {
                widget.value = String(value);
            }

            this.setSize(this.computeSize());
            this.setDirtyCanvas(true, true);
        };
    },
});
