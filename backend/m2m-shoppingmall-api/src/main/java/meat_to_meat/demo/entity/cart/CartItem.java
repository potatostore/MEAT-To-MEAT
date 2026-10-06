package meat_to_meat.demo.entity.cart;

import com.meat_to_meat.spb.entity.BaseEntity;
import com.meat_to_meat.spb.entity.product.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
