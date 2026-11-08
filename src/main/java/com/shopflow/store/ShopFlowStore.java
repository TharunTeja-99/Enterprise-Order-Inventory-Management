package com.shopflow.store;

import com.shopflow.model.Product;
import com.shopflow.model.Customer;
import com.shopflow.model.CustomerOrder;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ShopFlowStore {

    public final Map<Long, Product> products =
            new ConcurrentHashMap<>();

    public final Map<Long, Customer> customers =
            new ConcurrentHashMap<>();

    public final Map<Long, CustomerOrder> orders =
            new ConcurrentHashMap<>();

    public final AtomicLong productId = new AtomicLong(4);
    public final AtomicLong customerId = new AtomicLong(1);
    public final AtomicLong orderId = new AtomicLong(1);

    public ShopFlowStore() {

        products.put(1L,
                new Product(1L, "Laptop", "Electronics", 55000, 10));

        products.put(2L,
                new Product(2L, "Keyboard", "Accessories", 1500, 25));

        products.put(3L,
                new Product(3L, "Monitor", "Electronics", 12000, 8));

    }
}
