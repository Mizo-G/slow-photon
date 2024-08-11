import fs from "fs";
import { log } from "console";

export type Doc = {
  Name: string;
  Body: string;
  Desc: string;
  Params: string[];
  Returns: string[];
  Refs: string[];
  Meta: string;
};

var file,
  start: number,
  end: number,
  between: string,
  name: string,
  params: string[],
  returns: string[],
  refs: string[],
  body: string,
  desc: string,
  reg,
  doc: Doc;

const exampleDir = "./examples/";
fs.readdirSync(exampleDir).forEach((f) => {
  GenerateMdFile(f);
});

function GenerateMdFile(filePath: string) {
  file = fs
    .readFileSync(`${exampleDir}/${filePath}`, "utf8")
    .toString()
    .trim()
    .split("\n")
    .splice(1)
    .join("\n");

  body = file;

  reg = file.match(/\bprocedure\b/i);
  start = reg ? (reg.index ? reg.index + 9 : -1) : -1;
  end = file.search("@") - 1;
  between = file.slice(start, end);
  name = between.trim();

  start = file.search("@");
  reg = file.match(/\bas\b/i);
  end = reg ? (reg.index ? reg.index : -1) : -1;
  between = file.slice(start, end);
  params = between.split(",").map((p) => p.trim());

  reg = file.match(/\bstart docs\b/i);
  start = reg ? (reg.index ? reg.index - 1 : -1) : -1;
  reg = file.match(/\bend docs\b/i);
  end = reg ? (reg.index ? reg.index : -1) : -1;
  between = file.slice(start, end).split("\n").splice(1).join("\n").trim();

  const parsed = JSON.parse(between);
  desc = parsed.description;
  returns = parsed.returns;

  // Find the first occurrence of "as" (case-insensitive) and slice the content after it
  const afterAs = file.slice(file.search(/\bas\b/i));

  // Remove comments
  const cleanedFile = afterAs
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
    .replace(/--.*$/gm, ""); // Remove line comments

  // Match table names inside square brackets
  const tableNames = cleanedFile
    .match(/\[([^\]]+)\]/g)
    ?.map((name) => name.replace(/\[|\]/g, ""));

  // Get unique table names
  refs = Array.from(new Set(tableNames?.filter((n) => n !== "dbo")));

  doc = {
    Name: name,
    Body: body,
    Desc: desc,
    Params: params,
    Returns: returns,
    Refs: refs,
    Meta: "",
  };

  const mdPath = "./src/content/docs/";
  if (!fs.existsSync(mdPath)) {
    fs.mkdirSync(mdPath);
  }

  fs.writeFileSync(mdPath + doc.Name + ".md", generateMarkdownTemplate(doc));
}

function generateMarkdownTemplate(doc: Doc): string {
  const statusTemplate = `
## Status
- **Database Status**: <span style="color: green;">✔️ Passing</span>
- **Code Status**: <span style="color: red;">❌ Failing</span>
  `.trim();

  const paramsTemplate = doc.Params.map(
    (param) =>
      `- **${param.split(" ")[0]}**: \`${param.split(" ")[1]}\`, Default: \`null\``,
  ).join("\n");

  const returnsTemplate = doc.Returns.map((ret) => `- ${ret}`).join("\n");
  const refsTemplate = doc.Refs.map((ref) => `- ${ref}`).join("\n");

  return `---
title: "${doc.Name}"
description: "${doc.Desc}"
dbstatus: "✔️ Passing"
codestatus: "❌ Failing"
returns: 
${doc.Returns.map((ret) => `  - "${ret}"`).join("\n")}
params: 
${doc.Params.map((param) => `  - "${param}"`).join("\n")}
refs: 
${doc.Refs.map((ref) => `  - "${ref}"`).join("\n")}
createdby: "dbadmin"
---

## Title
**${doc.Name}**

---

## Description
${doc.Desc}

---

${statusTemplate}

---

## Params
${paramsTemplate}

---


## Returns
${returnsTemplate}

---


## References
${refsTemplate}

---

## Code

<details>
<summary>SQL</summary>

~~~~sql
${doc.Body.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "")} 
~~~~
</details>

<details>
<summary>C#</summary>

~~~~cs
code coming soon...
~~~~
</details>
`;
}
