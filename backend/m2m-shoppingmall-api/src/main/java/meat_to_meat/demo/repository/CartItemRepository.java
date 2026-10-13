package meat_to_meat.demo.repository;


import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface CartItemRepository extends JpaRepository<CartItem, Long>{
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}
