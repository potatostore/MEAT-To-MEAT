package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // 1. 다건 조회 (여러 줄 반환 -> List 사용, 최신순 정렬 지원)
    List<Order> findAllByUser_UserId(Long userId);
    List<Order> findAllByUser_UserIdOrderByCreatedAtDesc(Long userId);

    // 2. 단건 조회 (레코드 한 줄 반환 -> Optional 사용: 특정 유저의 특정 주문 검증용)
    Optional<Order> findByOrderIdAndUser_UserId(Long orderId, Long userId);
}