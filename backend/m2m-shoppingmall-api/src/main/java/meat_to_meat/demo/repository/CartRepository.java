package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    boolean existsByUser(User user);

    // 회원 1명당 장바구니 레코드는 1줄이므로 Optional로 반환
    Optional<Cart> findByUser(User user);
    Optional<Cart> findByUser_UserId(Long userId);
}