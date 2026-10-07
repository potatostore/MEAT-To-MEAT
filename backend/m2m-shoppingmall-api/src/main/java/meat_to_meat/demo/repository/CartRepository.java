package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 1. jpa가 무엇인지부터 알아야됨.
 * 2. JpaRepository를 상속하므로서 어떤 함수들이 CartRepository에 상속되는지 판단하고,
 * 3. CartRepository를 통해 서비스 레이어에서는 어떤 기능들을 구현할 것인지도 알아야함.
 *
 */
public interface CartRepository extends JpaRepository<Cart, Long> {

}
