import chroma from 'chroma-js';
import React from 'react';
import Select from 'react-select';

import { platformsWithLabels } from '../platforms';

const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: "white" }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
    const scale = chroma.scale([data.color, "black"]);
    const darker = scale(0.5).css(); // #FF7F7F
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? data.color
        : isFocused
        ? color.alpha(0.1).css()
        : undefined,
      color: isDisabled
        ? "#ccc"
        : isSelected
        ? chroma.contrast(color, "white") > 2
          ? "white"
          : "black"
        : data.color,
      cursor: isDisabled ? "not-allowed" : "default",

      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled
          ? isSelected
            ? data.color
            : color.alpha(0.3).css()
          : undefined,
      },
    };
  },
  multiValue: (styles, { data }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ":hover": {
      backgroundColor: data.color,
      color: "white",
    },
  }),
};

export default function MultiSelectPlatform({ onChange, value }) {
  return (
    <Select
      defaultValue={platformsWithLabels}
      isMulti
      className="basic-multi-select w-full text-gray-700"
      onChange={onChange}
      closeMenuOnSelect={false}
      options={platformsWithLabels}
      value={value}
      styles={colourStyles}
    />
  );
}
