package com.gogiseogogi.spb;

import jakarta.persistence.*;
import jakarta.persistence.Column;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@org.hibernate.annotations.Check(constraints = "product_price >= 1 AND product_quantity >= 1")

@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor
public class Product{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ElementCollection
    @CollectionTable(
            name = "product_category",
            joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "category_name", nullable = false)
    private List<String> productCategory = new ArrayList<>();

    @Column(nullable = false)
    private String description;

    @Column(unique = true,  nullable = false)
    private String productName;

    @Column(nullable = false)
    private Long productPrice;

    @Column(nullable = false)
    private Long productQuantity;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}