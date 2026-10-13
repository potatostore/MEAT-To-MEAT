package meat_to_meat.demo.entity.cart;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.BaseEntity;
import meat_to_meat.demo.entity.product.Product;

@Entity
@Getter
@NoArgsConstructor
@Table(name="cart_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cart_id", "product_id"})
})
public class CartItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(columnDefinition = "bigint check (quantity >= 1)", nullable = false)
    private Long quantity;

    @Builder
    public CartItem(Cart cart, Product product, Long quantity){
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
    }

    public void addQuantity(Long quantity){
        this.quantity += quantity;
    }

    public void updateQuantity(Long quantity){
        this.quantity = quantity;
    }

}
