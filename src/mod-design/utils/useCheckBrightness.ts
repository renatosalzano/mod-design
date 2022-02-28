import { useCallback } from "react";

export const useCheckBrightness = <T extends HTMLElement>(
  colorProperty: string,
  check?: boolean,
) => {
  const getBrightness = (color: string) => {
    const stringColor = color.trim();
    const channels: number[] = [];

    switch (true) {
      case /(rgba?)/.test(color):
        const RGB = stringColor
          .replace(/[rgba?()]/g, "")
          .replace(/[,?/?\s]/g, " ")
          .replace(/\s\s+/g, " ")
          .trim()
          .split(" ")
          .map((channel) => {
            if (/%/.test(channel)) {
              return Math.round((parseInt(channel) * 255) / 100);
            } else {
              return parseFloat(channel);
            }
          });
        channels.push(...RGB);
        break;
      case /#/.test(color):
        const stringHEX = stringColor.replace("#", "").trim();
        if (stringHEX.length === 3) {
          for (let i = 0; i < stringHEX.length; ++i) {
            channels.push(parseInt(stringHEX[i] + stringHEX[i + 1], 16));
          }
        } else {
          for (let i = 0; i < stringHEX.length; i += 2) {
            channels.push(parseInt(stringHEX[i] + stringHEX[i + 1], 16));
          }
        }

        break;
      case /hsl/.test(color):
        const lightness = stringColor
          .replace(/[hsl()]/g, "")
          .replace(/[%?,?/?\s]/g, " ")
          .replace(/\s\s+/g, " ")
          .trim()
          .split(" ")[2];
        return parseInt(lightness) > 50;
    }

    if (channels.length > 3) {
      // HAS ALPHA CHANNEL
      return channels[3] > 50;
    } else {
      const [r, g, b] = channels;
      return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    }
  };

  const isLight = useCallback((stringColor: string) => {
    return getBrightness(stringColor);
  }, []);

  const isDark = useCallback((stringColor: string) => {
    return !getBrightness(stringColor);
  }, []);

  const checkBrightness = useCallback(
    (node: T) => {
      const stringColor = getComputedStyle(node).getPropertyValue(colorProperty);
      return getBrightness(stringColor) ? "light" : "dark";
    },
    [colorProperty],
  );

  return { isLight, isDark, checkBrightness };
};
