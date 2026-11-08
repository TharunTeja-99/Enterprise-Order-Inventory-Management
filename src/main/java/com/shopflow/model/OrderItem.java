package com.shopflow.model;

public class OrderItem {

    private Long productId;
    private String productName;
    private int quantity;
    private double unitPrice;

    public OrderItem() {
    }

    public OrderItem(Long productId, String productName,
                     int quantity, double unitPrice) {

        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getUnitPrice() {
        return unitPrice;
    }
}
