const API_URL = "https://jsonplaceholder.typicode.com/users";

const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Cache the loaded users so filtering does not re-fetch.
let allUsers = [];

// Render any array of users into the list.
function renderUsers(list) {
  usersList.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    usersList.appendChild(li);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");

    const name = document.createElement("strong");
    name.textContent = user.name;
    li.appendChild(name);

    const email = document.createElement("p");
    email.textContent = `Email: ${user.email}`;
    li.appendChild(email);

    const city = document.createElement("p");
    city.textContent = `City: ${user.address.city}`;
    li.appendChild(city);

    const company = document.createElement("p");
    company.textContent = `Company: ${user.company.name}`;
    li.appendChild(company);

    usersList.appendChild(li);
  });
}

// Fetch users, checking response.ok, with loading/error states.
async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadBtn.disabled = true;
  usersList.innerHTML = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    allUsers = await response.json();

    renderUsers(allUsers);
    statusText.textContent = `Loaded ${allUsers.length} users.`;
  } catch (error) {
    statusText.textContent = "Could not load users. Please try again.";
    console.error("Load failed:", error.message);
    allUsers = [];
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadUsers);

// Filter the cached array — no new request.
filterInput.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase().trim();

  const filtered = allUsers.filter((user) =>
    user.name.toLowerCase().includes(query)
  );

  renderUsers(filtered);

  if (allUsers.length > 0 && filtered.length === 0) {
    statusText.textContent = "No users match your filter.";
  } else if (allUsers.length > 0) {
    statusText.textContent = `Showing ${filtered.length} of ${allUsers.length} users.`;
  }
});