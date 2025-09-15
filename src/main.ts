// src/main.ts
import Highcharts from "highcharts";
import {
  getChartContext,
  type ChartModel,
  type ChartConfig,
} from "@thoughtspot/ts-chart-sdk";

// ---- Helpers (your existing drawing logic, white background) ----
const fmt = (x?: number) =>
  x == null || Number.isNaN(Number(x)) ? "—" : Highcharts.numberFormat(+x, 1);

function drawCard(container: HTMLElement, data: {
  office: string; month: string;
  overall: number; priorOverall?: number;
  metrics: { label: string; value?: number; prior?: number }[];
  checklist?: { text: string; done: boolean }[];
}) {
  // Destroy any previous chart in this container
  // @ts-ignore
  if (container.__hc) { container.__hc.destroy(); }

  const chart = Highcharts.chart(container, {
    chart: {
      backgroundColor: "transparent",
      spacing: [0, 0, 0, 0],
      height: 300,
      events: {
        load()   { render(this); },
        render() { render(this); }
      }
    },
    title: undefined,
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: { visible: false },
    yAxis: { visible: false },
    tooltip: { enabled: false },
    series: []
  });

  // @ts-ignore stash for later destroys
  container.__hc = chart;

  function render(ch: Highcharts.Chart) {
    const r = ch.renderer;
    // Clear content (keep the root <svg>)
    // @ts-ignore
    r.boxWrapper.element.innerHTML = "";

    const pad = 10;
    const cardW = ch.chartWidth - pad * 2;
    const cardH = ch.chartHeight - pad * 2;
    const textColor = "#2d5a37";

    r.rect(pad, pad, cardW, cardH, 12)
      .attr({ fill: "#ffffff", stroke: "rgba(0,0,0,0.08)", "stroke-width": 1 })
      .add();

    r.text(data.office, pad + 16, pad + 30)
      .css({ fontSize: "22px", fontWeight: "700", color: textColor }).add();

    r.text(`${data.month} Overall`, pad + 16, pad + 50)
      .css({ fontSize: "12px", color: textColor, opacity: 0.85 }).add();

    const overallY = pad + 82;
    r.text(fmt(data.overall), pad + 16, overallY)
      .css({ fontSize: "30px", fontWeight: "700", color: textColor }).add();

    r.text(`(${fmt(data.priorOverall)})`, pad + 110, overallY)
      .css({ fontSize: "12px", color: textColor, opacity: 0.7 }).add();

    const gridTop = pad + 100;
    const gridLeft = pad + 12;
    const gridRight = pad + cardW - 12;
    const gridH = 70;
    const cols = data.metrics.length || 0;
    const colW = cols ? (gridRight - gridLeft) / cols : 0;

    r.path(["M", gridLeft, gridTop, "L", gridRight, gridTop])
      .attr({ stroke: "rgba(0,0,0,.12)", "stroke-width": 1 }).add();

    data.metrics.forEach((m, i) => {
      const cx = gridLeft + i * colW;
      r.rect(cx + 6, gridTop + 10, colW - 12, gridH - 20, 8)
        .attr({ fill: "#f6f8f7", stroke: "rgba(0,0,0,.06)" }).add();
      r.text(m.label, cx + colW / 2, gridTop + 26)
        .attr({ align: "center" })
        .css({ fontSize: "11px", color: textColor, opacity: 0.75 }).add();
      r.text(`${fmt(m.value)} (${fmt(m.prior)})`, cx + colW / 2, gridTop + 48)
        .attr({ align: "center" })
        .css({ fontSize: "15px", fontWeight: "600", color: textColor }).add();
    });

    const listStartY = gridTop + gridH + 16;
    (data.checklist || []).forEach((item, idx) => {
      const y = listStartY + idx * 18;
      r.text(item.text, pad + 16, y)
        .css({ fontSize: "12px", color: "#114a1e" }).add();
      const dotX = pad + cardW - 22, dotY = y - 5;
      const fill = item.done ? "#0a8f3c" : "#b9c7bd";
      r.circle(dotX, dotY, 5).attr({ fill, stroke: fill }).add();
    });
  }
}

// ---- ThoughtSpot SDK wrapper ----
// We’ll accept one row with these fields; you can rename in the TS field-mapper.
type Row = Record<string, any>;

function shape(model: ChartModel) {
  const rows = model.data() as Row[];
  if (!rows || rows.length === 0) return null;
  const r = rows[0]; // one row expected
  const val = (k: string) => r[k]?.value ?? r[k];

  return {
    office: String(val("office")),
    month: String(val("month")),
    overall: Number(val("overall")),
    priorOverall: Number(val("overall_prior")),
    metrics: [
      { label: "GM",         value: Number(val("gm")),     prior: Number(val("gm_prior")) },
      { label: "Production", value: Number(val("prod")),   prior: Number(val("prod_prior")) },
      { label: "Stability",  value: Number(val("stab")),   prior: Number(val("stab_prior")) },
      { label: "Amnts.",     value: Number(val("amnts")),  prior: Number(val("amnts_prior")) }
    ]
    // checklist: you can map fields here later if you want it data-driven
  };
}

(async () => {
  await getChartContext({
    // This defines what the TS field-mapper will ask you to provide.
    getDefaultChartConfig: (): ChartConfig[] => [
      { name: "office", type: "DIMENSION", required: true,  displayName: "Office" },
      { name: "month",  type: "DIMENSION", required: true,  displayName: "Month" },
      { name: "overall",        type: "MEASURE",  required: true, displayName: "Overall" },
      { name: "overall_prior",  type: "MEASURE",  optional: true, displayName: "Overall (Prior)" },
      { name: "gm",             type: "MEASURE",  optional: true, displayName: "GM" },
      { name: "gm_prior",       type: "MEASURE",  optional: true, displayName: "GM (Prior)" },
      { name: "prod",           type: "MEASURE",  optional: true, displayName: "Production" },
      { name: "prod_prior",     type: "MEASURE",  optional: true, displayName: "Production (Prior)" },
      { name: "stab",           type: "MEASURE",  optional: true, displayName: "Stability" },
      { name: "stab_prior",     type: "MEASURE",  optional: true, displayName: "Stability (Prior)" },
      { name: "amnts",          type: "MEASURE",  optional: true, displayName: "Amnts." },
      { name: "amnts_prior",    type: "MEASURE",  optional: true, displayName: "Amnts. (Prior)" }
    ],
    render: (el, model) => {
      const shaped = shape(model);
      (el as HTMLElement).innerHTML = ""; // clear
      if (!shaped) { (el as HTMLElement).innerHTML = "<em>No data</em>"; return; }
      drawCard(el as HTMLElement, shaped);
    },
    onDestroy: () => {}
  });
})();
