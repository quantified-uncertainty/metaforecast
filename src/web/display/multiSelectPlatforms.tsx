import chroma from "chroma-js";
import React from "react";
import Select from "react-select";

import { PlatformConfig } from "../../backend/platforms";

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

interface Props {
  onChange: (platforms: string[]) => void;
  value: string[];
  platformsConfig: PlatformConfig[];
}

export const MultiSelectPlatform: React.FC<Props> = ({
  onChange,
  value,
  platformsConfig,
}) => {
  type Option = {
    value: string;
    label: string;
    color: string;
  };

  const options: Option[] = platformsConfig.map((platform) => ({
    value: platform.name,
    label: platform.label,
    color: platform.color,
  }));

  const id2option: { [k: string]: Option } = {};
  for (const option of options) id2option[option.value] = option;

  const selectValue = value.map((v) => id2option[v]).filter((v) => v);

  const onSelectChange = (newValue: Option[]) => {
    onChange(newValue.map((o) => o.value));
  };

  return (
    <Select
      defaultValue={options}
      isMulti
      className="basic-multi-select w-full text-gray-700"
      onChange={onSelectChange}
      closeMenuOnSelect={false}
      options={options}
      value={selectValue}
      styles={colourStyles}
    />
  );
};
