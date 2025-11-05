const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

// Theme Management
function getStoredTheme() {
  return localStorage.getItem("theme") || "auto";
}

function setStoredTheme(theme) {
  localStorage.setItem("theme", theme);
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === "auto") {
    const systemTheme = getSystemTheme();
    root.setAttribute("data-theme", "auto");
  } else {
    root.setAttribute("data-theme", theme);
  }
  
  // Update theme icon
  const themeIcon = document.querySelector(".theme-icon");
  if (themeIcon) {
    if (theme === "dark" || (theme === "auto" && getSystemTheme() === "dark")) {
      themeIcon.textContent = "☀️";
    } else {
      themeIcon.textContent = "🌙";
    }
  }
}

function initializeTheme() {
  const storedTheme = getStoredTheme();
  const themeSelector = document.getElementById("themeSelector");
  
  if (themeSelector) {
    themeSelector.value = storedTheme;
    themeSelector.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      setStoredTheme(selectedTheme);
      applyTheme(selectedTheme);
    });
  }
  
  applyTheme(storedTheme);
  
  // Listen for system theme changes when in auto mode
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (getStoredTheme() === "auto") {
        applyTheme("auto");
      }
    });
  }
}

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return {};
    const parsed = JSON.parse(basket);
    // Handle backward compatibility - convert old array format to new object format
    if (Array.isArray(parsed)) {
      const basketObj = {};
      parsed.forEach((product) => {
        basketObj[product] = (basketObj[product] || 0) + 1;
      });
      localStorage.setItem("basket", JSON.stringify(basketObj));
      return basketObj;
    }
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return {};
  }
}

function addToBasket(product) {
  const basket = getBasket();
  basket[product] = (basket[product] || 0) + 1;
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";

  const basketEntries = Object.entries(basket);
  if (basketEntries.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }

  basketEntries.forEach(([product, quantity]) => {
    const item = PRODUCTS[product];
    if (item && quantity > 0) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${quantity}x ${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }

  // Calculate total quantity of all items
  const totalQuantity = Object.values(basket).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  if (totalQuantity > 0) {
    indicator.textContent = totalQuantity;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
  initializeTheme();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    renderBasketIndicator();
    initializeTheme();
  });
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
