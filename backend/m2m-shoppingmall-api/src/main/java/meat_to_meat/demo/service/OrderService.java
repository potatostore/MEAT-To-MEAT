package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.OrderUpdateDTO;
import meat_to_meat.demo.entity.order.Order;
import meat_to_meat.demo.entity.Order.OrderStatus;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.NpeCheck;
import meat_to_meat.demo.repository.OrderRepository;
import meat_to_meat.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // 1. 주문 생성 (유저 검증 후 기본 PAID 상태로 주문 생성)
    @Transactional
    public OrderResponseDTO createOrder(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.USER_NOT_FOUND.getMessage() + " id=" + userId));

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PAID)
                .totalOrderPrice(0L)
                .build();

        Order savedOrder = orderRepository.save(order);
        return new OrderResponseDTO(savedOrder);
    }

    // 2. 단건 주문 조회
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(Long orderId) {
        NpeCheck.checkNotNull(orderId, ErrorCode.ORDER_ID_NULL);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.ORDER_NOT_FOUND.getMessage() + " id=" + orderId));
        return new OrderResponseDTO(order);
    }

    // 3. 유저별 주문 목록 조회
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        return orderRepository.findAllByUser_UserId(userId).stream()
                .map(OrderResponseDTO::new)
                .collect(Collectors.toList());
    }

    // 4. 주문 상태 수정
    @Transactional
    public OrderResponseDTO updateOrder(Long orderId, OrderUpdateDTO orderUpdateDTO) {
        NpeCheck.checkNotNull(orderId, ErrorCode.ORDER_ID_NULL);
        NpeCheck.checkNotNull(orderUpdateDTO, ErrorCode.ORDER_DTO_NULL);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.ORDER_NOT_FOUND.getMessage() + " id=" + orderId));

        order.updateStatus(orderUpdateDTO.getOrderStatus());
        return new OrderResponseDTO(order);
    }

    // 5. 주문 삭제
    @Transactional
    public void deleteOrder(Long orderId) {
        NpeCheck.checkNotNull(orderId, ErrorCode.ORDER_ID_NULL);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.ORDER_NOT_FOUND.getMessage() + " id=" + orderId));
        orderRepository.delete(order);
    }
}