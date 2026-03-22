const DIAGRAM_HORIZONTAL_PADDING = 32;

function parseNumber(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function readSvgGeometry({ viewBox, widthAttr, heightAttr }) {
  if (typeof viewBox === 'string') {
    const segments = viewBox
      .trim()
      .split(/\s+/)
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
