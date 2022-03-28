import React, { useState } from "react";

let exampleInput = `{
  "title": "Random example",
  "description": "Just a random description of a random example",
  "ids": [ "metaculus-372", "goodjudmentopen-2244", "metaculus-7550", "kalshi-09d060ee-b184-4167-b86b-d773e56b4162", "wildeford-5d1a04e1a8", "metaculus-2817" ],
  "creator": "Peter Parker"
}`;

export function DashboardCreator({ handleSubmit }) {
  let [value, setValue] = useState(exampleInput);
  const [displayingDoneMessage, setDisplayingDoneMessage] = useState(false);
  const [displayingDoneMessageTimer, setDisplayingDoneMessageTimer] =
    useState(null);

  let handleChange = (event) => {
    setValue(event.target.value);
  };

  let handleSubmitInner = (event) => {
    clearTimeout(displayingDoneMessageTimer);
    event.preventDefault();
    //console.log(event)
    console.log("value@handleSubmitInner@DashboardCreator");
    //console.log(typeof(value));
    console.log(value);
    try {
      let newData = JSON.parse(value);
      //console.log(typeof(newData))
      //console.log(newData)
      if (!newData || !newData.ids || newData.ids.length == 0) {
        throw Error("Not enough objects");
      } else {
        handleSubmit(newData);
        setDisplayingDoneMessage(true);
        let timer = setTimeout(() => setDisplayingDoneMessage(false), 3000);
        setDisplayingDoneMessageTimer(timer);
      }
    } catch (error) {
      setDisplayingDoneMessage(false);
      //alert(error)
      //console.log(error)
      let substituteText = `Error: ${error.message}

Try something like:
${exampleInput}

Your old input was: ${value}`;
      setValue(substituteText);
    }
  };
  return (
    <form onSubmit={handleSubmitInner} className="block place-centers">
      <textarea
        value={value}
        onChange={handleChange}
        rows={8}
        cols={50}
        className=""
      />
      <br />
      <div className="grid grid-cols-3 text-center">
        <button
          className="block col-start-2 col-end-2 w-full bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mt-5 p-10 text-center"
          onClick={handleSubmitInner}
        >
          Create dashboard
        </button>
        <button
          className={
            displayingDoneMessage
              ? "block col-start-2 col-end-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-2 border border-blue-500 hover:border-transparent rounded mt-2 p-2 text-center "
              : "hidden "
          }
        >
          Done!
        </button>
        <p className="block col-start-1 col-end-4 bg-gray-200 text-gray-700  py-2 px-4 border border-transparent mt-5 p-10 text-center mb-6">
          You can find the necessary ids by toggling the advanced options in the
          search, or by visiting{" "}
          <a href="/api/all-forecasts">/api/all-forecasts</a>
        </p>
      </div>
    </form>
  );
}
