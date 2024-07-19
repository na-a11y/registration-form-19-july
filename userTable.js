function displayUsers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userTableBody = document.getElementById("userTable").getElementsByTagName("tbody")[0];
    userTableBody.innerHTML = ""; // Clear existing rows

    if (users.length > 0) {
        users.forEach((user, index) => {
            const row = userTableBody.insertRow();
            row.insertCell(0).textContent = user.fullName;
            row.insertCell(1).textContent = user.email;
            row.insertCell(2).textContent = user.mobile;
            row.insertCell(3).textContent = user.username;
            const actionsCell = row.insertCell(4);
            actionsCell.className = "actions-cell";

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-button";
            editButton.onclick = function() {
                editRow(row, index);
            };
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-button";
            deleteButton.onclick = function() {
                deleteUser(index);
            };
            actionsCell.appendChild(deleteButton);
        });
    }
}

function editRow(row, index) {
    const cells = row.getElementsByTagName("td");

    row.classList.add("editing");
    document.body.classList.add("editing-background");

    for (let i = 0; i < cells.length - 1; i++) {
        const cellValue = cells[i].textContent;
        cells[i].innerHTML = `<input type="text" value="${cellValue}" />`;
    }

    const actionsCell = cells[4];
    actionsCell.innerHTML = "";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "save-button";
    saveButton.onclick = function() {
        saveRow(row, index);
    };
    actionsCell.appendChild(saveButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "cancel-button";
    cancelButton.onclick = function() {
        displayUsers();
        document.body.classList.remove("editing-background");
    };
    actionsCell.appendChild(cancelButton);
}

function saveRow(row, index) {
    const inputs = row.getElementsByTagName("input");
    const updatedUser = {
        fullName: inputs[0].value,
        email: inputs[1].value,
        mobile: inputs[2].value,
        username: inputs[3].value,
    };

    let users = JSON.parse(localStorage.getItem("users")) || [];
    users[index] = updatedUser;
    localStorage.setItem("users", JSON.stringify(users));
    displayUsers();
    document.body.classList.remove("editing-background");
}

function deleteUser(index) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    displayUsers();
}

function goBack() {
    window.location.href = "index.html";
}

// Display users when the page loads
window.onload = function() {
    displayUsers();
};
