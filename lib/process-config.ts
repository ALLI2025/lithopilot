import type { ProcessStage } from "./types.ts";

/**
 * Demonstration process only. The real vacuum-interconnected tool modules,
 * recipes and thresholds must be replaced after an engineering review.
 */
export const processStages: ProcessStage[] = [
  {
    id: "load-lock",
    index: "01",
    name: "进样与真空准备",
    shortName: "进样",
    chamber: "LL-01",
    status: "completed",
    metric: "腔压",
    value: "3.2×10⁻⁴ Pa",
  },
  {
    id: "vacuum-transfer",
    index: "02",
    name: "真空互联传输",
    shortName: "传输",
    chamber: "VT-01",
    status: "completed",
    metric: "传输时长",
    value: "18.4 s",
  },
  {
    id: "surface-prep",
    index: "03",
    name: "表面预处理",
    shortName: "预处理",
    chamber: "SP-01",
    status: "completed",
    metric: "完成度",
    value: "100%",
  },
  {
    id: "resist-process",
    index: "04",
    name: "光刻胶工艺",
    shortName: "涂胶",
    chamber: "RC-01",
    status: "completed",
    metric: "均匀性",
    value: "98.7%",
  },
  {
    id: "align-expose",
    index: "05",
    name: "对准与曝光",
    shortName: "曝光",
    chamber: "EXP-01",
    status: "warning",
    metric: "腔压",
    value: "1.7×10⁻³ Pa",
  },
  {
    id: "develop",
    index: "06",
    name: "显影与清洗",
    shortName: "显影",
    chamber: "DEV-01",
    status: "pending",
    metric: "状态",
    value: "安全保持",
  },
  {
    id: "aoi",
    index: "07",
    name: "晶圆视觉检测",
    shortName: "AOI",
    chamber: "AOI-01",
    status: "active",
    metric: "缺陷率",
    value: "6.8%",
  },
  {
    id: "unload",
    index: "08",
    name: "下片与归档",
    shortName: "下片",
    chamber: "UL-01",
    status: "pending",
    metric: "状态",
    value: "等待放行",
  },
];

export const demoIncident = {
  incidentId: "LP-INC-260803-017",
  batchId: "VIL-260803-A17",
  waferId: "W18",
  title: "曝光腔压力漂移伴随边缘缺陷增多",
  processStage: "align-expose",
  symptom: "AOI发现边缘缺陷簇；曝光腔抽空时间延长且稳态压力越过演示阈值。",
};

export const assumptionNotice =
  "当前模块、参数与阈值均为受控演示配置，不代表真实设备工艺；接入实机前必须由工艺与设备负责人复核。";
