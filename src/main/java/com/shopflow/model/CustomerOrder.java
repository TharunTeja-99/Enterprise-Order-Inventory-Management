package com.shopflow.model;

import java.time.LocalDateTime;
import java.util.List;

public class CustomerOrder {

    private Long id;
    private Long customerId;
    private String customerName;
    private List<OrderItem> items;
    private double totalAmount;
    private String status;
    private LocalDateTime createdAt;

    public CustomerOrder() {
    }

    public CustomerOrder(Long id, Long customerId,
                         String customerName,
                         List<OrderItem> items,
                         double totalAmount,
                         String status,
                         LocalDateTime createdAt) {

        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
