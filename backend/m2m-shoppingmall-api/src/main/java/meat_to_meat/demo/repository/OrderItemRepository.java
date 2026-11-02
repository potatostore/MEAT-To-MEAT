package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.order.Order;
import meat_to_meat.demo.entity.order.OrderItem;
import meat_to_meat.demo.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 특정 주문에 속한 모든 주문 상품 조회 (다건 -> List)
    List<OrderItem> findAllByOrder(Order order);

    // 특정 주문 내 특정 상품 단건 조회 (단건 -> Optional)
    Optional<OrderItem> findByOrderAndProduct(Order order, Product product);
}