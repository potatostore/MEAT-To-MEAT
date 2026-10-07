package meat_to_meat.demo.entity.cart;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.BaseEntity;
import meat_to_meat.demo.entity.user.User;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "carts")
@NoArgsConstructor
public class Cart extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;


    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;


    // 상품/수량은 CartItem이 들고 있음 (cart 1 : N cart_items)
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems = new ArrayList<>();

}
