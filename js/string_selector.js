
import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "A2.StringSelector.Dynamic",

    nodeCreated(node) {
        if (node.comfyClass !== "StringSelector") return;

        function updateInputs() {
            if (!node.inputs) return;

            // 末尾の未接続端子を1つだけ残す
            const inputs = node.inputs.filter(
                input => /^text_\d+$/.test(input.name)
            );

            const connected = inputs.filter(
                input => input.link != null
            );

            // 接続済み端子を先頭に並べ直す
            // 未接続端子は末尾の1つだけにする
            for (let i = node.inputs.length - 1; i >= 0; i--) {
                const input = node.inputs[i];
                if (
                    /^text_\d+$/.test(input.name) &&
                    input.link == null
                ) {
                    node.removeInput(i);
                }
            }

            // 連番に振り直す
            const remaining = node.inputs.filter(
                input => /^text_\d+$/.test(input.name)
            );

            remaining.forEach((input, i) => {
                input.name = `text_${i}`;
                input.label = `text_${i}`;
            });

            // 次の接続用端子を追加
            node.addInput(`text_${remaining.length}`, "STRING");

            const last = node.inputs[node.inputs.length - 1];
            last.label = "+";

            node.setSize(node.computeSize());
            node.setDirtyCanvas(true, true);
        }

        const original = node.onConnectionsChange;

        node.onConnectionsChange = function(
            type, index, connected, linkInfo
        ) {
            original?.apply(this, arguments);

            // 入力端子の変更時だけ更新
            if (type === 1) {
                updateInputs();
            }
        };

        const originalConfigure = node.onConfigure;

        node.onConfigure = function(info) {
            originalConfigure?.call(this, info);
            updateInputs();
        };

        updateInputs();
    },
});
