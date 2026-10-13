package meat_to_meat.demo.repository; // 정상적인 repository 패키지 경로

import meat_to_meat.demo.entity.Order.Order; // 대문자 Order 패키지의 Order 엔티티 임포트
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}