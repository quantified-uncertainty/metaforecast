import React from 'react';

export default function DropdownForStars({
  value,
  onChange,
  options,
  howmanystars,
}) {
  const handleSelectOption = (event) => {
    onChange(event.target.value);
  };

  return (
    <select
      onChange={(e) => handleSelectOption(e)}
      className="border-none"
      value={options.filter((option) => howmanystars(option) == value)[0]}
    >
      {options.map((address, key) => {
        return (
          <option key={key} value={address}>
            {address}
          </option>
        );
      })}
    </select>
  );
}
