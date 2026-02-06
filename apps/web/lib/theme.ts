import { createTheme, type MantineColorsTuple } from "@mantine/core";

const brand: MantineColorsTuple = [
  "#e6f7ff",
  "#d0ecff",
  "#a3d5f7",
  "#72bdef",
  "#4ba8e8",
  "#339ae4",
  "#2193e3",
  "#0f7fca",
  "#0071b5",
  "#00629f",
];

export const theme = createTheme({
  primaryColor: "brand",
  colors: {
    brand,
  },
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
  defaultRadius: "md",
});
