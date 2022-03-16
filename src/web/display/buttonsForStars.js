import React, { useState } from "react";

export default function ButtonsForStars({ onChange, value }) {
  const onChangeInner = (buttonPressed) => {
    onChange(buttonPressed);
  };
  let setStyle = (buttonNumber) =>
    `flex row-span-1 col-start-${buttonNumber + 1} col-end-${
      buttonNumber + 2
    } items-center justify-center text-center${
      buttonNumber == value ? " text-blue-600" : ""
    }`;

  return (
    <div className="flex-1 flex-col justify-center items-center w-full">
      <div className="grid grid-rows-1 grid-cols-6 items-center content-center text-gray-500 w-full">
        <div className={setStyle(0)}> </div>
        <button className={setStyle(1)} onClick={() => onChangeInner(1)}>
          1+ ★
        </button>
        <button className={setStyle(2)} onClick={() => onChangeInner(2)}>
          2+ ★
        </button>
        <button className={setStyle(3)} onClick={() => onChangeInner(3)}>
          3+ ★
        </button>
        <button className={setStyle(4)} onClick={() => onChangeInner(4)}>
          4+ ★
        </button>
        <div className={setStyle(5)}> </div>
      </div>
    </div>
  );
}
