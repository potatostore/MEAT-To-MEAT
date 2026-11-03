package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    boolean existsByUser(User user);
    Optional<Cart> findByUser_UserId(Long userId);
}