// ======================================================
// Enterprise Order & Inventory Management
// Frontend JavaScript - No Database
// ======================================================

// Automatically detect the application context path.
// Example: /Enterprise-Order-Inventory-Management/api
const contextName = window.location.pathname
    .split("/")
    .filter(Boolean)[0];

const API_BASE = contextName
    ? `/${contextName}/api`
    : "/api";

let products = [];
let customers = [];
let orders = [];

// Default product images used when creating a new product.
const productImages = {
    Electronics:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
    Accessories:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600",
    Audio:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    Furniture:
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600",
    Other:
        "https://placehold.co/600x400?text=Product"
};

// ======================================================
// API REQUEST FUNCTION
// ======================================================

async function apiRequest(endpoint, options = {}) {

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    const responseText = await response.text();

    return responseText ? JSON.parse(responseText) : null;
}

// ======================================================
// LOAD ALL APPLICATION DATA
// ======================================================

async function loadAll() {

    try {

        const [productData, customerData, orderData] =
            await Promise.all([
                apiRequest("/products"),
                apiRequest("/customers"),
                apiRequest("/orders")
            ]);

        products = Array.isArray(productData) ? productData : [];
        customers = Array.isArray(customerData) ? customerData : [];
        orders = Array.isArray(orderData) ? orderData : [];

        renderProducts();
        renderCustomers();
        renderOrders();
        renderDashboard();
        updateOrderOptions();

    } catch (error) {

        console.error("Application loading error:", error);

        notify(
            "Unable to load application data. Check the backend API.",
            "error"
        );
    }
}

// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {

    const totalProducts = document.getElementById("total-products");
    const totalCustomers = document.getElementById("total-customers");
    const totalOrders = document.getElementById("total-orders");
    const totalStock = document.getElementById("total-stock");

    if (totalProducts) {
        totalProducts.textContent = products.length;
    }

    if (totalCustomers) {
        totalCustomers.textContent = customers.length;
    }

    if (totalOrders) {
        totalOrders.textContent = orders.length;
    }

    const stockCount = products.reduce(
        (total, product) => total + Number(product.stock || 0),
        0
    );

    if (totalStock) {
        totalStock.textContent = stockCount;
    }

    const recentOrders = document.getElementById("recent-orders");

    if (!recentOrders) return;

    if (orders.length === 0) {

        recentOrders.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No orders available yet.
                </td>
            </tr>
        `;

        return;
    }

    recentOrders.innerHTML = [...orders]
        .reverse()
        .slice(0, 5)
        .map(order => `
            <tr>
                <td>#${escapeHTML(order.id)}</td>
                <td>${escapeHTML(order.customerName || "Customer")}</td>
                <td>${formatCurrency(order.totalAmount || 0)}</td>
                <td>
                    <span class="status-badge ${statusClass(order.status)}">
                        ${escapeHTML(order.status || "Pending")}
                    </span>
                </td>
            </tr>
        `)
        .join("");
}

// ======================================================
// PRODUCTS
// ======================================================

function renderProducts() {

    const productList = document.getElementById("product-list");

    if (!productList) return;

    if (products.length === 0) {

        productList.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Add your first product using the form.</p>
            </div>
        `;

        return;
    }

    productList.innerHTML = products.map(product => {

        const image = product.imageUrl ||
            productImages[product.category] ||
            productImages.Other;

        const stock = Number(product.stock || 0);

        return `
            <article class="product-card">

                <div class="product-image-container">
                    <img
                        class="product-image"
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=No+Image';"
                    >

                    <span class="stock-badge ${stock === 0 ? "out-of-stock" : stock < 10 ? "low-stock" : "in-stock"}">
                        ${stock === 0 ? "Out of stock" : stock < 10 ? "Low stock" : "In stock"}
                    </span>
                </div>

                <div class="product-details">

                    <span class="product-category">
                        ${escapeHTML(product.category || "Other")}
                    </span>

                    <h3>${escapeHTML(product.name)}</h3>

                    <div class="product-price">
                        ${formatCurrency(product.price)}
                    </div>

                    <p class="product-stock">
                        Available stock: <strong>${stock}</strong>
                    </p>

                    <div class="product-actions">

                        <button
                            class="btn btn-edit"
                            onclick="editProduct(${Number(product.id)})">
                            Edit
                        </button>

                        <button
                            class="btn btn-delete"
                            onclick="deleteProduct(${Number(product.id)})">
                            Delete
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}

// ======================================================
// ADD OR UPDATE PRODUCT
// ======================================================

const productForm = document.getElementById("product-form");

if (productForm) {

    productForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const id = document.getElementById("product-id").value;
        const name = document.getElementById("product-name").value.trim();
        const category = document.getElementById("product-category").value;
        const price = Number(document.getElementById("product-price").value);
        const stock = Number(document.getElementById("product-stock").value);

        if (!name || !category || price < 0 || stock < 0) {
            notify("Please enter valid product details.", "error");
            return;
        }

        const existingProduct = products.find(
            product => String(product.id) === String(id)
        );

        const product = {
            name,
            category,
            price,
            stock,
            imageUrl: existingProduct?.imageUrl ||
                productImages[category] ||
                productImages.Other
        };

        try {

            if (id) {

                await apiRequest(`/products/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(product)
                });

                notify("Product updated successfully.", "success");

            } else {

                await apiRequest("/products", {
                    method: "POST",
                    body: JSON.stringify(product)
                });

                notify("Product added successfully.", "success");
            }

            resetProductForm();
            await loadAll();

        } catch (error) {

            console.error(error);
            notify("Unable to save product: " + error.message, "error");
        }
    });
}

// ======================================================
// EDIT PRODUCT
// ======================================================

function editProduct(id) {

    const product = products.find(
        item => Number(item.id) === Number(id)
    );

    if (!product) return;

    document.getElementById("product-id").value = product.id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-category").value = product.category;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-stock").value = product.stock;

    const title = document.getElementById("product-form-title");

    if (title) {
        title.textContent = "Update Product";
    }

    document.getElementById("product-form")
        .scrollIntoView({ behavior: "smooth", block: "center" });
}

// ======================================================
// RESET PRODUCT FORM
// ======================================================

function resetProductForm() {

    const form = document.getElementById("product-form");

    if (form) {
        form.reset();
    }

    const id = document.getElementById("product-id");

    if (id) {
        id.value = "";
    }

    const title = document.getElementById("product-form-title");

    if (title) {
        title.textContent = "Add New Product";
    }
}

const cancelEditButton = document.getElementById("cancel-edit");

if (cancelEditButton) {
    cancelEditButton.addEventListener("click", resetProductForm);
}

// ======================================================
// DELETE PRODUCT
// ======================================================

async function deleteProduct(id) {

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {

        await apiRequest(`/products/${id}`, {
            method: "DELETE"
        });

        notify("Product deleted successfully.", "success");

        await loadAll();

    } catch (error) {

        console.error(error);
        notify("Unable to delete product: " + error.message, "error");
    }
}

// ======================================================
// CUSTOMERS
// ======================================================

function renderCustomers() {

    const customerList = document.getElementById("customer-list");

    if (!customerList) return;

    if (customers.length === 0) {

        customerList.innerHTML = `
            <div class="empty-state">
                <h3>No customers found</h3>
                <p>Register a customer to get started.</p>
            </div>
        `;

        return;
    }

    customerList.innerHTML = customers.map(customer => `

        <div class="customer-card">

            <div class="customer-avatar">
                ${escapeHTML((customer.name || "C").charAt(0).toUpperCase())}
            </div>

            <div class="customer-details">
                <h3>${escapeHTML(customer.name)}</h3>
                <p>${escapeHTML(customer.email)}</p>
                <p>${escapeHTML(customer.phone || "No phone number")}</p>
            </div>

        </div>

    `).join("");
}

// ======================================================
// ADD CUSTOMER
// ======================================================

const customerForm = document.getElementById("customer-form");

if (customerForm) {

    customerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const customer = {
            name: document.getElementById("customer-name").value.trim(),
            email: document.getElementById("customer-email").value.trim(),
            phone: document.getElementById("customer-phone").value.trim()
        };

        if (!customer.name || !customer.email) {
            notify("Customer name and email are required.", "error");
            return;
        }

        try {

            await apiRequest("/customers", {
                method: "POST",
                body: JSON.stringify(customer)
            });

            customerForm.reset();

            notify("Customer registered successfully.", "success");

            await loadAll();

        } catch (error) {

            console.error(error);
            notify("Unable to register customer: " + error.message, "error");
        }
    });
}

// ======================================================
// ORDER DROPDOWN OPTIONS
// ======================================================

function updateOrderOptions() {

    const customerSelect = document.getElementById("order-customer");
    const productSelect = document.getElementById("order-product");

    if (customerSelect) {

        const selectedCustomer = customerSelect.value;

        customerSelect.innerHTML = `
            <option value="">Select Customer</option>
            ${customers.map(customer => `
                <option value="${Number(customer.id)}">
                    ${escapeHTML(customer.name)}
                </option>
            `).join("")}
        `;

        if (selectedCustomer) {
            customerSelect.value = selectedCustomer;
        }
    }

    if (productSelect) {

        const selectedProduct = productSelect.value;

        productSelect.innerHTML = `
            <option value="">Select Product</option>
            ${products
                .filter(product => Number(product.stock) > 0)
                .map(product => `
                    <option value="${Number(product.id)}">
                        ${escapeHTML(product.name)}
                        - ${formatCurrency(product.price)}
                        (Stock: ${Number(product.stock)})
                    </option>
                `).join("")}
        `;

        if (selectedProduct) {
            productSelect.value = selectedProduct;
        }
    }
}

// ======================================================
// PLACE ORDER
// ======================================================

const orderForm = document.getElementById("order-form");

if (orderForm) {

    orderForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const customerId = Number(
            document.getElementById("order-customer").value
        );

        const productId = Number(
            document.getElementById("order-product").value
        );

        const quantity = Number(
            document.getElementById("order-quantity").value
        );

        const selectedProduct = products.find(
            product => Number(product.id) === productId
        );

        if (!customerId || !productId || quantity < 1) {
            notify("Please select a customer, product and valid quantity.", "error");
            return;
        }

        if (!selectedProduct || quantity > Number(selectedProduct.stock)) {
            notify("Requested quantity is not available in stock.", "error");
            return;
        }

        const order = {
            customerId,
            items: [
                {
                    productId,
                    quantity
                }
            ]
        };

        try {

            await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify(order)
            });

            orderForm.reset();

            notify("Order placed successfully.", "success");

            await loadAll();

        } catch (error) {

            console.error(error);
            notify("Unable to place order: " + error.message, "error");
        }
    });
}

// ======================================================
// DISPLAY ORDERS
// ======================================================

function renderOrders() {

    const orderList = document.getElementById("order-list");

    if (!orderList) return;

    if (orders.length === 0) {

        orderList.innerHTML = `
            <div class="empty-state">
                <h3>No orders found</h3>
                <p>Place your first order to see it here.</p>
            </div>
        `;

        return;
    }

    orderList.innerHTML = [...orders].reverse().map(order => {

        const items = Array.isArray(order.items) ? order.items : [];

        const itemNames = items.map(item =>
            `${escapeHTML(item.productName || "Product")} × ${Number(item.quantity || 0)}`
        ).join(", ");

        return `
            <div class="order-card">

                <div class="order-card-header">
                    <div>
                        <span class="order-id">Order #${escapeHTML(order.id)}</span>
                        <h3>${escapeHTML(order.customerName || "Customer")}</h3>
                    </div>

                    <span class="status-badge ${statusClass(order.status)}">
                        ${escapeHTML(order.status || "Pending")}
                    </span>
                </div>

                <p class="order-items">
                    ${itemNames || "No item details"}
                </p>

                <div class="order-card-footer">

                    <strong>${formatCurrency(order.totalAmount || 0)}</strong>

                    <select
                        class="status-select"
                        aria-label="Update order status"
                        onchange="changeStatus(${Number(order.id)}, this.value)">

                        <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
                        <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                        <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>

                    </select>

                </div>

            </div>
        `;

    }).join("");
}

// ======================================================
// CHANGE ORDER STATUS
// ======================================================

async function changeStatus(id, status) {

    try {

        await apiRequest(`/orders/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status })
        });

        notify("Order status updated.", "success");

        await loadAll();

    } catch (error) {

        console.error(error);
        notify("Unable to update order status: " + error.message, "error");
    }
}

// ======================================================
// NOTIFICATION MESSAGE
// ======================================================

function notify(message, type = "success") {

    const messageElement = document.getElementById("message");

    if (!messageElement) {
        alert(message);
        return;
    }

    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = "block";

    window.clearTimeout(notify.timeout);

    notify.timeout = window.setTimeout(() => {
        messageElement.style.display = "none";
    }, 3500);
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function formatCurrency(value) {

    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function statusClass(status) {

    return String(status || "pending")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
}

// ======================================================
// INITIALIZE APPLICATION
// ======================================================

document.addEventListener("DOMContentLoaded", loadAll);
