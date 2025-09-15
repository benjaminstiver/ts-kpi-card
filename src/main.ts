import { getChartContext, type ChartModel, type ChartConfig } from "@thoughtspot/ts-chart-sdk";

(async () => {
  await getChartContext({
    getDefaultChartConfig: (): ChartConfig[] => [
      { name: "office", type: "DIMENSION", optional: true }
    ],
    render: (el, model: ChartModel) => {
      const rows = model.data();
      (el as HTMLElement).innerHTML =
        `<div style="font:14px/1.4 system-ui;padding:12px;border:1px dashed #ccc;">
           ✅ Custom chart loaded.<br>
           Rows received: <b>${rows.length}</b>
         </div>`;
    },
    onDestroy: () => {}
  });
})();
