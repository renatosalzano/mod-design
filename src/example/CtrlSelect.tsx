import { FC, useEffect, useRef, useState } from "react";
import { Select } from "../mod-design/core";

interface Test {
  value: number;
  name: string;
  codice: string;
  codice_catastale: string;
}
const TEST = {
  value: 6831,
  name: "ALBANO LAZIALE",
  codice: "ALBANO LAZIALE",
  codice_catastale: "A132",
};

const CtrlSelect: FC = () => {
  const [options, setOptions] = useState<any[]>([]);
  /* const [value, setValue] = useState<any>(TEST);

  const handleChange = (value: typeof TEST[]) => {
    setValue(value);
  }; */
  const [value, setValue] = useState<typeof TEST | null>(TEST);

  const handleChange = (value: typeof TEST | null) => {
    setValue(value);
  };
  const fetchData = useRef(async () => {
    try {
      const res = await fetch("http://localhost:3333/select-data");
      const body = (await res.json()) as any[];
      setOptions(body);
    } catch (error) {
      console.error("SERVER OFFLINE", error);
    }
  });
  useEffect(() => {
    fetchData.current();
  }, []);
  return (
    <Select
      name="select"
      value={value}
      onChange={handleChange}
      options={[]}
      emptyOption="quello che vuoi"
      noOptionLabel="None"
      disableOptions={["FONTE NUOVA", ""]}
      setOption={(option) => ({
        label: option.lol || option.name,
        value: option,
      })}
    />
  );
};

export default CtrlSelect;

/* <div>
      <select>
        {options.map((option: any) => {
          return (
            <option key={option.name} value={option.codice}>
              {option.name}
            </option>
          );
        })}
      </select>
      <Select
        multiple
        name="select"
        value={value}
        onChange={handleChange}
        options={options}
        emptyOption
        noOptionLabel="None"
        filterOption="floating"
        setOption={(option) => ({
          label: option.lol,
          value: option.pokemon,
        })}
      />
    </div> */
