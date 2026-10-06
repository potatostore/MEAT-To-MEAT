package com.gogiseogogi.spb.entity.cart;

import com.gogiseogogi.spb.entity.product.Product;
import com.gogiseogogi.spb.entity.user.User;
import com.gogiseogogi.spb.global.config.UrlNames;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = UrlNames.cartTableName)
@NoArgsConstructor
public class Cart extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;


    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;



    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(columnDefinition = "integer check (quantity >= 1)")
    private Long productQuantity;

    @ManyToMany
    @JoinColumn(name = "cart_item_id")
    private CartItem cartItem;



}
