const defaultOptions = {
  instantMacros: {
    ".g": "https://www.github.com/",
    ".y": "https://www.youtube.com/",
    ".p": "https://www.pass.proton.me",
    ".m": "https://www.mail.proton.me",
    ".d": "https://www.drive.proton.me",
    ".h": "https://news.ycombinator.com/",
    ".a": "https://claude.ai/new",
  },
  searchMacros: {
    "?y": "https://www.youtube.com/results?search_query=",
    "?o": "https://www.google.com/search?q=site%3Astackoverflow.com+",
    "?r": "https://github.com/search?type=repositories&q=",
    "?c": "https://github.com/search?type=code&q=",
  },
};

const saveSettings = () => {
  const [instantMacros, searchMacros] = [
    document.getElementById("instantMacros"),
    document.getElementById("searchMacros"),
  ].map(tableToObject);

  browser.storage.sync.set({
    instantMacros: instantMacros,
    searchMacros: searchMacros,
  });
};

/**
 * @param {"searchMacros" | "instantMacros"} type
 * @param {string} macro
 * */

const wrapInTd = (node) => {
  const td = document.createElement("td");
  td.append(node);
  return td;
};

const createRemoveTrButton = (tr) => {
  const removeTrButton = document.createElement("button");
  removeTrButton.append("Remove");
  removeTrButton.addEventListener("click", () => {
    tr.remove();
    saveSettings();
  });
  return removeTrButton;
};

const createCreateRowButton = (tBody) => {
  const createRowButton = document.createElement("button");

  createRowButton.addEventListener("click", () => {
    const tr = document.createElement("tr");
    const macroInput = document.createElement("input");
    const urlInput = document.createElement("input");
    const submitNewRowButton = document.createElement("button");

    submitNewRowButton.append("Done");
    submitNewRowButton.addEventListener("click", () => {
      macroInput.replaceWith(macroInput.value);
      urlInput.replaceWith(urlInput.value);

      submitNewRowButton.replaceWith(createRemoveTrButton(tr));
      const createRowButtonTr = document.createElement("tr");
      createRowButtonTr.append(wrapInTd(createCreateRowButton(tBody)));
      tBody.append(createRowButtonTr);
      saveSettings();
    });

    const inputsTr = document.createElement("tr");
    inputsTr.append(
      ...[macroInput, urlInput, submitNewRowButton].map(wrapInTd),
    );
    tBody.lastChild.replaceWith(inputsTr);
  });

  createRowButton.append("Create new row");

  return createRowButton;
};

/**
 * @param {Record<string, string>} options
 * @param {"instantMacros" | "searchMacros"} type
 */
const createTable = (options, type) => {
  const table = document.createElement("table");
  table.id = type;
  const tHead = document.createElement("thead");
  const headingTr = document.createElement("tr");
  const macroTh = document.createElement("th");
  macroTh.append("Macro");
  const urlTh = document.createElement("th");
  urlTh.append("URL");
  const emptyTh = document.createElement("th");
  headingTr.append(macroTh, urlTh, emptyTh);
  tHead.append(headingTr);
  const tBody = document.createElement("tbody");
  table.append(tHead, tBody);

  for (const macro in options) {
    const tr = document.createElement("tr");
    tBody.append(tr);

    const url = options[macro];

    const removeTrButton = createRemoveTrButton(tr);

    tr.append(...[macro, url, removeTrButton].map(wrapInTd));
  }

  const createRowButtonTr = document.createElement("tr");
  const createRowButtonTd = wrapInTd(createCreateRowButton(tBody));

  createRowButtonTd.colSpan = 3;

  createRowButtonTr.append(createRowButtonTd);
  tBody.append(createRowButtonTr);

  return table;
};

const isEmptyObject = (object) => Object.keys(object).length === 0;

/**
 * @param {HTMLTableElement} table
 * */
const tableToObject = (table) => {
  const tableBody = Array.from(table.tBodies)[0];
  const headers = Array.from(table.tHead.rows[0].cells);

  return Array.from(tableBody.rows)
    .slice(0, -1)
    .reduce((acc1, row) => {
      const cells = Array.from(row.cells).map((cell) => cell.textContent);

      return {
        ...acc1,
        [cells[0]]: cells[1],
      };
    }, {});
};

const restoreOptions = () => {
  function createInstantMacrosTable(result) {
    const instantMacrosTable = createTable(
      isEmptyObject(result)
        ? defaultOptions.instantMacros
        : result.instantMacros,
      "instantMacros",
    );
    document.getElementById("instantMacros").replaceWith(instantMacrosTable);
  }

  function createSearchMacrosTable(result) {
    console.log(result.searchMacros);
    const searchMacrosTable = createTable(
      isEmptyObject(result) ? defaultOptions.searchMacros : result.searchMacros,
      "searchMacros",
    );
    document.getElementById("searchMacros").replaceWith(searchMacrosTable);
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }
  browser.storage.sync
    .get("instantMacros")
    .then(createInstantMacrosTable, onError);
  browser.storage.sync
    .get("searchMacros")
    .then(createSearchMacrosTable, onError);
};

document.addEventListener("DOMContentLoaded", restoreOptions);
