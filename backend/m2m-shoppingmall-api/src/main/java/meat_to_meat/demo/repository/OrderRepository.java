package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByUser_UserId(Long userId);
}