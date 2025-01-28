// Get DOM elements
const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTableBody');
const addUserBtn = document.getElementById('addUserBtn');
const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('cancelBtn');
const errorDisplay = document.getElementById('errorDisplay');

let users = [];
let selectedUser = null;

// Fetch users when page loads
window.onload = fetchUsers;

async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();

        users = data.map(user => ({
            id: user.id,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ')[1] || '',
            email: user.email,
            department: user.company.name
        }));

        displayUsers();
    } catch (error) {
        showError('Failed to load users.');
    }
}

// Display users in table
function displayUsers() {
    userTableBody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.department}</td>
            <td>
                <button class="btn btn-secondary" onclick="editUser(${user.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// Add user
addUserBtn.onclick = function() {
    selectedUser = null;
    userForm.reset();
    modal.style.display = 'flex';
}

// Cancel modal
cancelBtn.onclick = function() {
    modal.style.display = 'none';
}

// Handle form submit
userForm.onsubmit = async function(e) {
    e.preventDefault();

    const userData = {
        firstName: userForm.firstName.value,
        lastName: userForm.lastName.value,
        email: userForm.email.value,
        department: userForm.department.value
    };

    try {
        if (selectedUser) {
            await fetch(`https://jsonplaceholder.typicode.com/users/${selectedUser.id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });

            users = users.map(user =>
                user.id === selectedUser.id ? {
                    ...userData,
                    id: user.id
                } : user
            );
        } else {
            await fetch('https://jsonplaceholder.typicode.com/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            userData.id = users.length + 1;
            users.push(userData);
        }

        displayUsers();
        modal.style.display = 'none';
    } catch (error) {
        showError('Failed to save user.');
    }
}

// Edit user
function editUser(id) {
    selectedUser = users.find(user => user.id === id);
    if (selectedUser) {
        userForm.firstName.value = selectedUser.firstName;
        userForm.lastName.value = selectedUser.lastName;
        userForm.email.value = selectedUser.email;
        userForm.department.value = selectedUser.department;
        modal.style.display = 'flex';
    }
}

// Delete user
async function deleteUser(id) {
    try {
        await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
            method: 'DELETE'
        });
        users = users.filter(user => user.id !== id);
        displayUsers();
    } catch (error) {
        showError('Failed to delete user.');
    }
}

// Show error message
function showError(message) {
    errorDisplay.innerHTML = `<div class="error-message">${message}</div>`;
    setTimeout(() => errorDisplay.innerHTML = '', 3000);
}
