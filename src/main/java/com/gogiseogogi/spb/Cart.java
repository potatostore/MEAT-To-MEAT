package com.gogiseogogi.spb;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "carts")
@NoArgsConstructor

public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;


    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;


    /*
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(columnDefinition = "integer check (quantity >= 1)")
    private Long productQuantity;

    @ManyToMany
    @JoinColumn(name = "cart_item_id")
    private Product product;
    */


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
