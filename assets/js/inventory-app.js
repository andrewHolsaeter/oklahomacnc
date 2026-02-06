let tools = [];
let allColumns = [];

const COLUMN_DEFS = [
  { key: "image", label: "Image", type: "image", sortable: false },
  { key: "id", label: "Tool ID", sortable: true },
  { key: "Name", label: "Name", sortable: true },
  { key: "Sub Type", label: "Sub Type", sortable: true },
  { key: "[ØDC] Cutting Diameter", label: "ØDC", sortable: true },
  { key: "Material", label: "Material", sortable: true },
  { key: "[LOC] Length Of Cut", label: "LOC", sortable: true},
  { key: "[OAL] Overall Length", label: "Overall Length", sortable: true }
];

const IMAGE_BASE_PATH = "data/images/";
const IMAGE_EXTENSIONS = ["jpg", "png", "jpeg"];
const PLACEHOLDER_IMAGE = "data/images/placeholder.jpg";

let currentSortKey = null;
let currentSortDir = "asc"; // "asc" | "desc"
let currentView = [];

fetch("data/all_tools.json")
  .then(res => res.json())
  .then(rawData => {
    tools = Object.entries(rawData).map(([id, tool]) => ({
      id,
      ...tool
    }));

    buildTableHeader();;
    populateSubTypeFilter();
    renderTable(tools);
    currentView = [...tools];
  });

function sortCurrentView() {
  const colDef = COLUMN_DEFS.find(c => c.key === currentSortKey);

  currentView.sort((a, b) => {
    let valA = a[currentSortKey];
    let valB = b[currentSortKey];

    if (colDef?.sortType === "number") {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    } else {
      valA = (valA ?? "").toString().toLowerCase();
      valB = (valB ?? "").toString().toLowerCase();
    }

    if (valA < valB) return currentSortDir === "asc" ? -1 : 1;
    if (valA > valB) return currentSortDir === "asc" ? 1 : -1;
    return 0;
  });
}

function updateSortIndicators() {
  document.querySelectorAll("th").forEach(th => {
    th.classList.remove("sorted-asc", "sorted-desc");
  });

  const index = COLUMN_DEFS.findIndex(c => c.key === currentSortKey);
  if (index >= 0) {
    const th = document.querySelectorAll("th")[index];
    th.classList.add(
      currentSortDir === "asc" ? "sorted-asc" : "sorted-desc"
    );
  }
}

function onSort(col) {
  if (currentSortKey === col.key) {
    currentSortDir = currentSortDir === "asc" ? "desc" : "asc";
  } else {
    currentSortKey = col.key;
    currentSortDir = "asc";
  }

  sortCurrentView();
  updateSortIndicators();
  renderTable(currentView);
}

function buildTableHeader() {
  const headerRow = document.getElementById("tableHeaderRow");
  headerRow.innerHTML = "";

  COLUMN_DEFS.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.label;

    if (col.sortable) {
      th.classList.add("sortable");
      th.addEventListener("click", () => onSort(col));
    }

    headerRow.appendChild(th);
  });
}

function applyFilter(filteredData) {
  currentView = [...filteredData];

  if (currentSortKey) {
    sortCurrentView();
  }

  renderTable(currentView);
}

function populateSubTypeFilter() {
  const filter = document.getElementById("subTypeFilter");
  const subTypes = [...new Set(
    tools.map(t => t["Sub Type"]).filter(Boolean)
  )];

  subTypes.forEach(st => {
    const option = document.createElement("option");
    option.value = st;
    option.textContent = st;
    filter.appendChild(option);
  });
}

document.getElementById("subTypeFilter").addEventListener("change", e => {
  const value = e.target.value;
  const filtered = value === "all"
    ? tools
    : tools.filter(t => t["Sub Type"] === value);

  applyFilter(filtered);
});

function createToolImage(toolId) {
  const img = document.createElement("img");
  img.loading = "lazy";

  img.src = `${IMAGE_BASE_PATH}${toolId}.${IMAGE_EXTENSIONS[0]}`;

  img.onerror = () => {
    img.onerror = null;
    img.src = PLACEHOLDER_IMAGE;
  };

  return img;
}

function renderTable(data) {
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";

  data.forEach(tool => {
    const tr = document.createElement("tr");

    COLUMN_DEFS.forEach(col => {
      const td = document.createElement("td");
      
      // IMAGE COLUMN
      if (col.type === "image") {
        // Wrapper needed for hover preview
        const wrapper = document.createElement("div");
        wrapper.className = "image-preview-wrapper";

        const img = createToolImage(tool.id);
        img.alt = tool.Name || tool.id;

        // Set CSS variable used by ::after for preview image
        wrapper.style.setProperty(
          "--preview-image",
          `url(${img.src})`
        );

        wrapper.appendChild(img);
        td.appendChild(wrapper);
      }
      else if (col.label === "Tool ID") {
        const value = tool[col.key];
        //td.textContent = value != null ? `$${Number(value).toFixed(2)}` : "";

        const wrapper = document.createElement("div");
        // If Haas Tooling
        // Create anchor link
        if (tool["Vendor"] == "Haas Tooling") {
          const anchor = document.createElement("a");
          anchor.href = "https://www.haastooling.com/p/"+tool.id;
          anchor.target = "_blank";
          anchor.textContent = tool[col.key];
          
          wrapper.appendChild(anchor);
        }
        else if(tool["Vendor"] == "McMaster-Carr") {
          const anchor = document.createElement("a");
          anchor.href = " https://www.mcmaster.com/"+tool.id;
          anchor.target = "_blank";
          anchor.textContent = tool[col.key];
          
          wrapper.appendChild(anchor);
        }
        else {
          td.textContent = tool[col.key] ?? "";
        }
        
        td.appendChild(wrapper);
        
      }
      else if (col.type === "currency") {
        const value = tool[col.key];
        td.textContent = value != null ? `$${Number(value).toFixed(2)}` : "";
      }
      else {
        td.textContent = tool[col.key] ?? "";
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function formatHeader(header) {
  if (header === "id") return "Tool ID";
  if (header === "image") return "Image";
  return header;
}


