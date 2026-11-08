package com.shopflow.controller;

import com.shopflow.model.*;
import com.shopflow.service.ShopFlowService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ShopFlowController {

    private final ShopFlowService service;

    public ShopFlowController(ShopFlowService service) {
        this.service = service;
    }

    // PRODUCTS

    @GetMapping("/products")
    public List<Product> getProducts() {
        return service.getProducts();
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        return service.addProduct(product);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return service.updateProduct(id, product);
    }

    @DeleteMapping("/products/{id}")
    public Map<String, String> deleteProduct(@PathVariable Long id) {

        service.deleteProduct(id);

        return Map.of("message", "Product deleted successfully");
    }

    // CUSTOMERS

    @GetMapping("/customers")
    public List<Customer> getCustomers() {
        return service.getCustomers();
    }

    @PostMapping("/customers")
    public Customer addCustomer(@RequestBody Customer customer) {
        return service.addCustomer(customer);
    }

    // ORDERS

    @GetMapping("/orders")
    public List<CustomerOrder> getOrders() {
        return service.getOrders();
    }

    @PostMapping("/orders")
    public CustomerOrder createOrder(
            @RequestBody Map<String, Object> request) {

        Long customerId = Long.valueOf(
                request.get("customerId").toString()
        );

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawItems =
                (List<Map<String, Object>>) request.get("items");

        List<OrderItem> items = rawItems.stream()
                .map(item -> new OrderItem(
                        Long.valueOf(item.get("productId").toString()),
                        null,
                        Integer.parseInt(item.get("quantity").toString()),
                        0
                ))
                .toList();

        return service.createOrder(customerId, items);
    }

    @PatchMapping("/orders/{id}/status")
    public CustomerOrder updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        return service.updateOrderStatus(id, request.get("status"));
    }
}
