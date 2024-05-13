import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const constructUrl = (urlString: string, data: string[]): string => {
  let result = urlString;
  data.forEach((value, index) => {
    const placeholder = `\${var${index}}`;
    while (result.includes(placeholder)) {
      result = result.replace(placeholder, value);
    }
  });
  return result;
};

export const parseTextEnclosedInBrackets = (text: string) => {
  const regex = /\{(.*?)\}/g;
  const matches = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  return matches;
};
