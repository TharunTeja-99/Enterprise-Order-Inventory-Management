package com.shopflow.model;

public class Product {

    private Long id;
    private String name;
    private String category;
    private double price;
    private int stock;
    private String imageUrl;

    // Default constructor
    public Product() {
    }

    // Constructor without image URL
    public Product(Long id, String name, String category,
                   double price, int stock) {

        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
    }

    // Constructor with image URL
    public Product(Long id, String name, String category,
                   double price, int stock, String imageUrl) {

        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.imageUrl = imageUrl;
    }

    // Get ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Get product name
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Get category
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // Get price
    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    // Get stock
    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    // Get image URL
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
