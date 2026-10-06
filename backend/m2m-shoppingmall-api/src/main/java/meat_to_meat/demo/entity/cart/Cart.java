package meat_to_meat.demo.entity.cart;

import com.meat_to_meat.spb.entity.product.Product;
import com.meat_to_meat.spb.entity.user.User;
import com.meat_to_meat.spb.global.config.UrlNames;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.BaseEntity;

@Entity
@Getter
@Table(name = UrlNames.cartTableName)
@NoArgsConstructor
public class Cart extends BaseEntity {

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
