const DIAGRAM_HORIZONTAL_PADDING = 32;
const CSS_UNIT_TO_PX = {
  cm: 96 / 2.54,
  in: 96,
  mm: 96 / 25.4,
  pc: 16,
  pt: 4 / 3,
  px: 1,
};

function parseNumber(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)([a-z%]*)$/i);

  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  const unit = match[2].toLowerCase();
  if (unit === '') {
    return parsed;
  }

  const multiplier = CSS_UNIT_TO_PX[unit];
  return multiplier ? parsed * multiplier : null;
}

export function readSvgGeometry({ viewBox, widthAttr, heightAttr }) {
  if (typeof viewBox === 'string') {
    const segments = viewBox
      .trim()
      .split(/[\s,]+/)
      .map((segment) => Number.parseFloat(segment));

    if (segments.length === 4 && segments.every((segment) => Number.isFinite(segment))) {
      const [, , width, height] = segments;

      if (width > 0 && height > 0) {
        return { width, height };
      }
    }
  }

  const width = parseNumber(widthAttr);
  const height = parseNumber(heightAttr);

  if (width && height) {
    return { width, height };
  }

  return null;
}

export function getMermaidSizing({ viewBox, widthAttr, heightAttr, containerWidth }) {
  const geometry = readSvgGeometry({ viewBox, widthAttr, heightAttr });
  const availableWidth = Math.max((containerWidth || 0) - DIAGRAM_HORIZONTAL_PADDING, 0);

  if (!geometry) {
    return {
      isPortrait: false,
      targetWidth: availableWidth,
    };
  }

  const isPortrait = geometry.height > geometry.width;
  const targetWidth = Math.min(geometry.width, availableWidth || geometry.width);

  return {
    isPortrait,
    targetWidth,
  };
}
