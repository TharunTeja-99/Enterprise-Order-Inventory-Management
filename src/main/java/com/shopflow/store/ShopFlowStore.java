package com.shopflow.store;

import com.shopflow.model.Product;
import com.shopflow.model.Customer;
import com.shopflow.model.CustomerOrder;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ShopFlowStore {

    public final ConcurrentHashMap<Long, Product> products =
            new ConcurrentHashMap<>();

    public final ConcurrentHashMap<Long, Customer> customers =
            new ConcurrentHashMap<>();

    public final ConcurrentHashMap<Long, CustomerOrder> orders =
            new ConcurrentHashMap<>();

    public final AtomicLong productId = new AtomicLong(0);
    public final AtomicLong customerId = new AtomicLong(0);
    public final AtomicLong orderId = new AtomicLong(0);

    public ShopFlowStore() {

        addProduct("Dell Inspiron Laptop", "Electronics",
                65000, 15,
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600");

        addProduct("Wireless Mouse", "Accessories",
                1200, 40,
                "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600");

        addProduct("Mechanical Keyboard", "Accessories",
                3500, 25,
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600");

        addProduct("4K Monitor", "Electronics",
                28000, 12,
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600");

        addProduct("Wireless Headphones", "Audio",
                4500, 30,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600");

        addProduct("Smartphone", "Electronics",
                35000, 20,
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600");
    }

    private void addProduct(String name, String category,
                            double price, int stock, String imageUrl) {

        Long id = productId.incrementAndGet();

        Product product = new Product(
                id, name, category, price, stock, imageUrl
        );

        products.put(id, product);
    }
}
