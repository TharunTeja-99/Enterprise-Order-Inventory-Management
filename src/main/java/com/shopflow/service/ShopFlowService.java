package com.shopflow.service;

import com.shopflow.model.*;
import com.shopflow.store.ShopFlowStore;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
public class ShopFlowService {

    private final ShopFlowStore store;

    public ShopFlowService(ShopFlowStore store) {
        this.store = store;
    }

    // PRODUCT OPERATIONS

    public List<Product> getProducts() {
        return new ArrayList<>(store.products.values());
    }

    public Product addProduct(Product product) {

        Long id = store.productId.getAndIncrement();
        product.setId(id);

        store.products.put(id, product);

        return product;
    }

    public Product updateProduct(Long id, Product updated) {

        Product existing = store.products.get(id);

        if (existing == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Product not found");
        }

        updated.setId(id);
        store.products.put(id, updated);

        return updated;
    }

    public void deleteProduct(Long id) {

        Product removed = store.products.remove(id);

        if (removed == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Product not found");
        }
    }

    // CUSTOMER OPERATIONS

    public List<Customer> getCustomers() {
        return new ArrayList<>(store.customers.values());
    }

    public Customer addCustomer(Customer customer) {

        Long id = store.customerId.getAndIncrement();
        customer.setId(id);

        store.customers.put(id, customer);

        return customer;
    }

    // ORDER OPERATIONS

    public List<CustomerOrder> getOrders() {
        return new ArrayList<>(store.orders.values());
    }

    public CustomerOrder createOrder(
            Long customerId, List<OrderItem> requestedItems) {

        Customer customer = store.customers.get(customerId);

        if (customer == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Customer not found");
        }

        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Order must contain items");
        }

        double total = 0;
        List<OrderItem> confirmedItems = new ArrayList<>();

        // Validate all items before reducing any stock
        for (OrderItem item : requestedItems) {

            if (item.getQuantity() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Quantity must be positive");
            }

            Product product = store.products.get(item.getProductId());

            if (product == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found");
            }

            if (product.getStock() < item.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for " + product.getName());
            }

            confirmedItems.add(new OrderItem(
                    product.getId(),
                    product.getName(),
                    item.getQuantity(),
                    product.getPrice()
            ));

            total += product.getPrice() * item.getQuantity();
        }

        // Reduce stock after validation
        for (OrderItem item : confirmedItems) {

            Product product = store.products.get(item.getProductId());

            product.setStock(product.getStock() - item.getQuantity());
        }

        Long id = store.orderId.getAndIncrement();

        CustomerOrder order = new CustomerOrder(
                id,
                customer.getId(),
                customer.getName(),
                confirmedItems,
                total,
                "PENDING",
                LocalDateTime.now()
        );

        store.orders.put(id, order);

        return order;
    }

    public CustomerOrder updateOrderStatus(Long id, String status) {

        CustomerOrder order = store.orders.get(id);

        if (order == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Order not found");
        }

        List<String> validStatuses = List.of(
                "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"
        );

        if (status == null || !validStatuses.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        order.setStatus(status);

        return order;
    }
}
