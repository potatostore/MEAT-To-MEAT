package com.gogiseogogi.spb.entity.cart;

import com.gogiseogogi.spb.entity.BaseEntity;
import com.gogiseogogi.spb.entity.product.Product;
import com.google.errorprone.annotations.OverridingMethodsMustInvokeSuper;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name="cart_items")
public class CartItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartItemId;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @Column(nullable = false)
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @Column(nullable = false)
    private Product product;

    @Column(columnDefinition = "integer check (quantity >= 1)", nullable = false)
    private Long quantity;
}
