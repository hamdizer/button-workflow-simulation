export function getSvgXCenter({ containerLeft, containerWidth, svgLeft, svgWidth }) {
  return (containerLeft - svgLeft) + containerWidth / 2;
}

export function getConnectorXCenter({ containerLeft, containerWidth, svgLeft }) {
  return containerLeft - svgLeft + containerWidth / 2;
}

export function getConditionalLaneX({ centerX, thenLaneOffset, elseLaneOffset }) {
  return {
    thenX: centerX + thenLaneOffset,
    elseX: centerX + elseLaneOffset
  };
}

