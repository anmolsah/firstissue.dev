/**
 * Utility to convert oklch colors to rgb(a) in a DOM element's styles.
 * html2canvas (v1.4.1) doesn't support oklch color function.
 */

const oklchToRgb = (colorStr) => {
  if (!colorStr || !colorStr.includes('oklch')) return colorStr;
  
  try {
    const temp = document.createElement('div');
    temp.style.color = colorStr;
    document.body.appendChild(temp);
    const resolved = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);
    return resolved;
  } catch (e) {
    return colorStr;
  }
};

const resolveOklchInString = (str) => {
  if (!str || !str.includes('oklch')) return str;
  
  // Replace all occurrences of oklch(...) with their rgb equivalent
  // This regex handles basic oklch() functions
  return str.replace(/oklch\([^)]+\)/g, (match) => {
    return oklchToRgb(match);
  });
};

/**
 * Sanitizes a DOM element and its children by converting oklch colors to rgb.
 * To be used in html2canvas's onclone callback.
 */
export const fixOklchInElement = (clonedElement) => {
  const elements = clonedElement.querySelectorAll('*');
  
  elements.forEach((el) => {
    // We need to check both inline styles and computed styles
    // Since oklch is likely coming from Tailwind classes (stylesheets),
    // we convert computed styles to inline styles to bypass html2canvas's CSS parser issues
    
    const style = window.getComputedStyle(el);
    const props = [
      'color', 
      'backgroundColor', 
      'borderColor', 
      'borderTopColor', 
      'borderRightColor', 
      'borderBottomColor', 
      'borderLeftColor', 
      'fill', 
      'stroke',
      'backgroundImage',
      'boxShadow'
    ];

    props.forEach(prop => {
      const val = style[prop];
      if (val && val.includes('oklch')) {
        el.style[prop] = resolveOklchInString(val);
      }
    });
  });
};
