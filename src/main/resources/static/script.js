const API = window.location.pathname.startsWith("/ShopFlow")
    ? "/ShopFlow/api"
    : "/api";

let products = [];
let customers = [];
let orders = [];

async function apiRequest(path, options = {}) {

    const response = await fetch(API + path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function notify(message) {
    const box = document.getElementById("message");
    box.textContent = message;
    box.classList.add("show");

    setTimeout(() => box.classList.remove("show"), 3000);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// NAVIGATION

document.querySelectorAll(".nav").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".nav").forEach(item =>
            item.classList.remove("active")
        );

        document.querySelectorAll(".section").forEach(section =>
            section.classList.remove("active-section")
        );

        button.classList.add("active");

        const section = button.dataset.section;

        document.getElementById(section)
            .classList.add("active-section");

        document.getElementById("page-title").textContent =
            button.textContent;

        loadAll();
    });
});

// LOAD DATA

async function loadAll() {

    try {
        [products, customers, orders] = await Promise.all([
            apiRequest("/products"),
            apiRequest("/customers"),
            apiRequest("/orders")
        ]);

        renderProducts();
        renderCustomers();
        renderOrders();
        renderDashboard();
        updateOrderOptions();

    } catch (error) {
        notify(error.message);
    }
}

// PRODUCTS

function renderProducts() {

    const tbody = document.getElementById("product-list");

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${escapeHTML(product.name)}</td>
            <td>${escapeHTML(product.category)}</td>
            <td>₹${Number(product.price).toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="action-btn"
                    onclick="editProduct(${product.id})">Edit</button>
                <button class="action-btn delete-btn"
                    onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

document.getElementById("product-form")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const id = document.getElementById("product-id").value;

        const product = {
            name: document.getElementById("product-name").value,
            category: document.getElementById("product-category").value,
            price: Number(document.getElementById("product-price").value),
            stock: Number(document.getElementById("product-stock").value)
        };

        try {
            if (id) {
                await apiRequest(`/products/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(product)
                });
                notify("Product updated successfully");
            } else {
                await apiRequest("/products", {
                    method: "POST",
                    body: JSON.stringify(product)
                });
                notify("Product added successfully");
            }

            resetProductForm();
            await loadAll();

        } catch (error) {
            notify(error.message);
        }
    });

function editProduct(id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    document.getElementById("product-id").value = product.id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-category").value = product.category;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-stock").value = product.stock;

    document.getElementById("product-form-title").textContent =
        "Update Product";

    document.getElementById("cancel-edit").classList.remove("hidden");
}

function resetProductForm() {

    document.getElementById("product-form").reset();
    document.getElementById("product-id").value = "";

    document.getElementById("product-form-title").textContent =
        "Add New Product";

    document.getElementById("cancel-edit").classList.add("hidden");
}

document.getElementById("cancel-edit")
    .addEventListener("click", resetProductForm);

async function deleteProduct(id) {

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        await apiRequest(`/products/${id}`, { method: "DELETE" });
        notify("Product deleted successfully");
        await loadAll();
    } catch (error) {
        notify(error.message);
    }
}

// CUSTOMERS

function renderCustomers() {

    document.getElementById("customer-list").innerHTML =
        customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${escapeHTML(customer.name)}</td>
                <td>${escapeHTML(customer.email)}</td>
                <td>${escapeHTML(customer.phone)}</td>
            </tr>
        `).join("");
}

document.getElementById("customer-form")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const customer = {
            name: document.getElementById("customer-name").value,
            email: document.getElementById("customer-email").value,
            phone: document.getElementById("customer-phone").value
        };

        try {
            await apiRequest("/customers", {
                method: "POST",
                body: JSON.stringify(customer)
            });

            document.getElementById("customer-form").reset();

            notify("Customer registered successfully");
            await loadAll();

        } catch (error) {
            notify(error.message);
        }
    });

// ORDERS

function updateOrderOptions() {

    const customerSelect = document.getElementById("order-customer");
    const productSelect = document.getElementById("order-product");

    customerSelect.innerHTML =
        '<option value="">Select customer</option>' +
        customers.map(customer =>
            `<option value="${customer.id}">${escapeHTML(customer.name)}</option>`
        ).join("");

    productSelect.innerHTML =
        '<option value="">Select product</option>' +
        products.map(product =>
            `<option value="${product.id}" ${product.stock === 0 ? "disabled" : ""}>
                ${escapeHTML(product.name)} (Stock: ${product.stock})
            </option>`
        ).join("");
}

document.getElementById("order-form")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const order = {
            customerId: Number(
                document.getElementById("order-customer").value
            ),
            items: [{
                productId: Number(
                    document.getElementById("order-product").value
                ),
                quantity: Number(
                    document.getElementById("order-quantity").value
                )
            }]
        };

        try {
            await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify(order)
            });

            document.getElementById("order-form").reset();

            notify("Order created successfully");
            await loadAll();

        } catch (error) {
            notify(error.message);
        }
    });

function renderOrders() {

    document.getElementById("order-list").innerHTML =
        orders.map(order => {

            const itemNames = order.items.map(item =>
                `${escapeHTML(item.productName)} × ${item.quantity}`
            ).join(", ");

            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${escapeHTML(order.customerName)}</td>
                    <td>${itemNames}</td>
                    <td>₹${Number(order.totalAmount).toFixed(2)}</td>
                    <td><span class="status">${escapeHTML(order.status)}</span></td>
                    <td>
                        <select onchange="changeStatus(${order.id}, this.value)">
                            ${["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]
                                .map(status =>
                                    `<option value="${status}"
                                        ${order.status === status ? "selected" : ""}>
                                        ${status}
                                    </option>`
                                ).join("")}
                        </select>
                    </td>
                </tr>
            `;
        }).join("");
}

async function changeStatus(id, status) {

    try {
        await apiRequest(`/orders/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status })
        });

        notify("Order status updated");
        await loadAll();

    } catch (error) {
        notify(error.message);
        await loadAll();
    }
}

// DASHBOARD

function renderDashboard() {

    document.getElementById("total-products").textContent =
        products.length;

    document.getElementById("total-customers").textContent =
        customers.length;

    document.getElementById("total-orders").textContent =
        orders.length;

    document.getElementById("total-stock").textContent =
        products.reduce((total, product) => total + product.stock, 0);

    const recent = [...orders].reverse().slice(0, 5);

    document.getElementById("recent-orders").innerHTML =
        recent.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${escapeHTML(order.customerName)}</td>
                <td>₹${Number(order.totalAmount).toFixed(2)}</td>
                <td><span class="status">${escapeHTML(order.status)}</span></td>
            </tr>
        `).join("");
}

// INITIAL LOAD

loadAll();
