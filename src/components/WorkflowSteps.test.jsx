import React from "react";
import { describe, it, expect } from "vitest";

import { getConnectorXCenter, getConditionalLaneX } from "../utils/arrowGeometry";

describe("arrowGeometry", () => {
  it("computes connectorX center correctly", () => {
    const x = getConnectorXCenter({ containerLeft: 100, containerWidth: 200, svgLeft: 0 });
    expect(x).toBe(200);
  });

  it("computes conditional lane x positions from center + offsets", () => {
    const { thenX, elseX } = getConditionalLaneX({ centerX: 200, thenLaneOffset: 10, elseLaneOffset: -10 });
    expect(thenX).toBe(210);
    expect(elseX).toBe(190);
  });
});

