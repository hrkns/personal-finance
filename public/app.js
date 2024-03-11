let personalFinanceData = null;

const categories = [
  { id: "all", text: "Todas las Categorias", selected: true },
];

$(document).ready(function () {
  $("#categorySelect").select2({
    placeholder: "Select categories",
    allowClear: true,
  });
  $("#categorySelect").select2({
    data: categories,
  });
  $("#categorySelect").on("change", drawData);

  $("#monthSelect").select2({
    placeholder: "Select months",
    allowClear: false,
  });
  $("#monthSelect").on("change", drawData);
});

let isRequestInProgress = false;

function generateCategoryTree(categories) {
  const root = {};

  categories.forEach((category) => {
    const levels = category.split(" - ");
    let currentLevel = root;

    levels.forEach((level, index) => {
      if (!currentLevel[level]) {
        currentLevel[level] = {};
      }

      currentLevel = currentLevel[level];
    });
  });

  return root;
}

document.getElementById("fetchData").addEventListener("click", function () {
  if (isRequestInProgress) {
    return;
  }

  const button = document.getElementById("fetchData");
  const sheetUrl = document.getElementById("sheetUrl").value;
  const sheetId = extractSheetId(sheetUrl);
  const useCache = document.getElementById("useCache").checked;

  if (!sheetId) {
    alert("Invalid Google Sheet URL");
    return;
  }

  isRequestInProgress = true;
  button.disabled = true;
  button.textContent = "Fetching Data...";

  const ignoreCache = !useCache;

  fetch(
    `http://localhost:3000/data?sheetId=${sheetId}&ignoreCache=${ignoreCache}`
  )
    .then((response) => response.json())
    .then((data) => {
      personalFinanceData = data;
      const categories = Object.keys(data).reduce((acc, month) => {
        const monthData = data[month];
        monthData.forEach((row) => {
          const category = row.concept;
          if (!acc.includes(category)) {
            acc.push(category);
          }
        });
        return acc;
      }, []);
      $("#categorySelect").empty();
      $("#categorySelect").append(
        new Option("Todas las Categorias", "all", false, true)
      );
      categories.forEach((category) => {
        const option = new Option(category, category, false, false);
        $("#categorySelect").append(option);
      });
      $("#categorySelect").trigger("change");
      document.getElementById("categorySelectContainer").style.display =
        "block";
      document.getElementById("monthSelectContainer").style.display = "block";
      drawData();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. See console for details.");
    })
    .finally(() => {
      isRequestInProgress = false;
      button.disabled = false;
      button.textContent = "Fetch Data";
    });
});

function extractSheetId(url) {
  const matches = /\/d\/([a-zA-Z0-9-_]+)/.exec(url);
  return matches ? matches[1] : null;
}

function drawData() {
  console.log({
    personalFinanceData,
    categories: $("#categorySelect").val(),
    month: $("#monthSelect").val(),
  });
}
