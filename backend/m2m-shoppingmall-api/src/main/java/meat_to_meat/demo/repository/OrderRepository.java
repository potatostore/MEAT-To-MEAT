package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // idx_orders_user_created (user_id, create_at) 를 타는 사용자별 최신순 조회
    List<Order> findAllByUser_UserIdOrderByCreateAtDesc(Long userId);

    Optional<Order> findByOrderIdAndUser_UserId(Long orderId, Long userId);

    boolean existsByOrderItems_Product_ProductId(Long productId);
}
