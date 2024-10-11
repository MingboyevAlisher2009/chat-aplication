import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import animationData from "@/assets/lottie-json";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const colors = [
  "bg-[#712c4a__OPACITY__] text-[#ff006e] border-[1px] border-[#ff006f__OPACITY__]",
  "bg-[#ffd60a__OPACITY__] text-[#ffd60a] border-[1px] border-[#ffd60a__OPACITY__]",
  "bg-[#06d6a0__OPACITY__] text-[#06d6a0] border-[1px] border-[#06d6a0__OPACITY__]",
  "bg-[#4cc9f0__OPACITY__] text-[#4cc9f0] border-[1px] border-[#4cc9f0__OPACITY__]",
];

export const getColor = (colorIndex, opacity = "2a") => {
  if (colorIndex >= 0 && colorIndex < colors.length) {
    return colors[colorIndex].replace(/__OPACITY__/g, opacity);
  }
  return colors[0].replace(/__OPACITY__/g, opacity); // Fallback to the first color if out of range
};

export const animationDefaultOptions = {
  loop: true,
  autoPlay: true,
  animationData,
};
