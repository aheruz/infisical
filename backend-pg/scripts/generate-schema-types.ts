/* eslint-disable */
import dotenv from "dotenv";
import path from "path";
import knex from "knex";
import { writeFileSync } from "fs";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

dotenv.config({
  path: path.join(__dirname, "../.env"),
  debug: true
});

const db = knex({
  client: "pg",
  connection: process.env.DB_CONNECTION_URI
});

const getZodPrimitiveType = (type: string) => {
  switch (type) {
    case "uuid":
      return "z.string().uuid()";
    case "character varying":
      return "z.string()";
    case "ARRAY":
      return "z.string().array()";
    case "boolean":
      return "z.boolean()";
    case "jsonb":
      return "z.unknown()";
    case "json":
      return "z.unknown()";
    case "timestamp with time zone":
      return "z.date()";
    case "integer":
      return "z.number()";
    case "bigint":
      return "z.coerce.number()";
    case "text":
      return "z.string()";
    default:
      throw new Error(`Invalid type: ${type}`);
  }
};

const getZodDefaultValue = (type: unknown, value: string | number | boolean | Object) => {
  if (!value || value === "null") return;
  switch (type) {
    case "uuid":
      return;
    case "character varying": {
      if (value === "gen_random_uuid()") return;
      if (typeof value === "string" && value.includes("::")) {
        return `.default(${value.split("::")[0]})`;
      }
      return `.default(${value})`;
    }
    case "ARRAY":
      return `.default(${value})`;
    case "boolean":
      return `.default(${value})`;
    case "jsonb":
      return "z.string()";
    case "json":
      return "z.string()";
    case "timestamp with time zone": {
      if (value === "CURRENT_TIMESTAMP") return;
      return "z.string().datetime()";
    }
    case "integer": {
      if ((value as string).includes("nextval")) return;
      return `.default(${value})`;
    }
    case "bigint": {
      if ((value as string).includes("nextval")) return;
      return `.default(${parseInt((value as string).split("::")[0].slice(1, -1), 10)})`;
    }
    case "text":
      if (typeof value === "string" && value.includes("::")) {
        return `.default(${value.split("::")[0]})`;
      }
      return `.default(${value})`;
    default:
      throw new Error(`Invalid type: ${type}`);
  }
};

const main = async () => {
  const tables = (
    await db("information_schema.tables")
      .whereRaw("table_schema =  current_schema()")
      .select<{ tableName: string }[]>("table_name as tableName")
      .orderBy("table_name")
  ).filter((el) => !el.tableName.includes("_migrations"));

  console.log("Select a table to generate schema");
  console.table(tables);
  console.log("all: all tables");
  const selectedTables = prompt("Type table numbers comma seperated: ");
  const tableNumbers =
    selectedTables !== "all" ? selectedTables.split(",").map((el) => Number(el)) : [];

  for (let i = 0; i < tables.length; i += 1) {
    // skip if not desired table
    if (selectedTables !== "all" && !tableNumbers.includes(i)) continue;

    const { tableName } = tables[i];
    const columns = await db(tableName).columnInfo();
    const columnNames = Object.keys(columns);

    let schema = "";
    for (let colNum = 0; colNum < columnNames.length; colNum++) {
      const columnName = columnNames[colNum];
      const colInfo = columns[columnName];
      let ztype = getZodPrimitiveType(colInfo.type);
      if (colInfo.defaultValue) {
        const { defaultValue } = colInfo;
        const zSchema = getZodDefaultValue(colInfo.type, defaultValue);
        if (zSchema) {
          ztype = ztype.concat(zSchema);
        }
      }
      if (colInfo.nullable) {
        ztype = ztype.concat(".nullable().optional()");
      }
      schema = schema.concat(`${!schema ? "\n" : ""}  ${columnName}: ${ztype},\n`);
    }

    const dashcase = tableName.split("_").join("-");
    const pascalCase = tableName
      .split("_")
      .reduce(
        (prev, curr) => prev + `${curr.at(0)?.toUpperCase()}${curr.slice(1).toLowerCase()}`,
        ""
      );
    writeFileSync(
      path.join(__dirname, "../src/db/schemas", `${dashcase}.ts`),
      `// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";

import { TImmutableDBKeys } from "./models";

export const ${pascalCase}Schema = z.object({${schema}});

export type T${pascalCase} = z.infer<typeof ${pascalCase}Schema>;
export type T${pascalCase}Insert = Omit<T${pascalCase}, TImmutableDBKeys>;
export type T${pascalCase}Update = Partial<Omit<T${pascalCase}, TImmutableDBKeys>>;
`
    );

    // const file = readFileSync(path.join(__dirname, "../src/db/schemas/index.ts"), "utf8");
    // if (!file.includes(`export * from "./${dashcase};"`)) {
    //   appendFileSync(
    //     path.join(__dirname, "../src/db/schemas/index.ts"),
    //     `\nexport * from "./${dashcase}";`,
    //     "utf8"
    //   );
    // }
  }

  process.exit(0);
};

main();
