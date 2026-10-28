package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.OrderUpdateDTO;
import meat_to_meat.demo.entity.Order.Order;
import meat_to_meat.demo.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // 1. 주문 생성 (Controller의 createOrder와 연결)
    @Transactional
    public OrderResponseDTO createOrder(Long userId) {
        // 추후 주문 생성 비즈니스 로직 구현
        return null;
    }

    // 2. 단건 주문 조회 (Getter - Controller의 getOrder와 연결)
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 없습니다. id=" + orderId));
        return new OrderResponseDTO(order);
    }

    // 3. 주문 상태 수정 (Update - 수정된 DTO 리턴)
    @Transactional
    public OrderResponseDTO updateOrder(Long orderId, OrderUpdateDTO orderUpdateDTO) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 없습니다. id=" + orderId));

        order.updateStatus(orderUpdateDTO.getOrderStatus()); // getOrderStatus()로 수정 완료
        return new OrderResponseDTO(order);
    }

    // 4. 주문 삭제 (Controller의 deleteOrder와 연결)
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 없습니다. id=" + orderId));
        orderRepository.delete(order);
    }
}