package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.OrderUpdateDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.order.Order;
import meat_to_meat.demo.entity.order.OrderItem;
import meat_to_meat.demo.entity.order.OrderStatus;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.global.exception.NpeCheck;
import meat_to_meat.demo.repository.CartRepository;
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
    private final CartRepository cartRepository;

    @Transactional
    public OrderResponseDTO createOrder(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND, "id=" + userId));

        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "userId=" + userId));

        // CUD 예외 처리: 장바구니가 비어 있으면 주문 불가
        if (cart.getCartItems().isEmpty()) {
            throw new NotFoundException(ErrorCode.CART_ITEM_NOT_FOUND, "장바구니가 비어 있습니다.");
        }

        long totalOrderPrice = 0L;
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            product.removeStock(cartItem.getQuantity()); // 재고 부족 시 내부에서 OUT_OF_STOCK 예외 발생
            totalOrderPrice += product.getProductPrice() * cartItem.getQuantity();
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PAID)
                .totalOrderPrice(totalOrderPrice)
                .build();

        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity().intValue())
                    .orderPrice(cartItem.getProduct().getProductPrice())
                    .build();
            order.getOrderItems().add(orderItem); // CascadeType.ALL에 의해 OrderItem 자동 저장
        }

        Order savedOrder = orderRepository.save(order);

        // 주문 완료된 장바구니 품목 비우기 (orphanRemoval = true로 자동 삭제)
        cart.getCartItems().clear();

        return new OrderResponseDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(Long orderId) {
        NpeCheck.checkNotNull(orderId, ErrorCode.ORDER_ID_NULL);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.ORDER_NOT_FOUND, "id=" + orderId));
        return new OrderResponseDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        if (!userRepository.existsById(userId)) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND, "id=" + userId);
        }

        return orderRepository.findAllByUser_UserId(userId).stream()
                .map(OrderResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDTO updateOrder(Long orderId, OrderUpdateDTO orderUpdateDTO) {
        NpeCheck.checkNotNull(orderId, ErrorCode.ORDER_ID_NULL);
        NpeCheck.checkNotNull(orderUpdateDTO, ErrorCode.ORDER_DTO_NULL);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.ORDER_NOT_FOUND, "id=" + orderId));

        order.updateStatus(orderUpdateDTO.getOrderStatus());
        return new OrderResponseDTO(order);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        NpeCheck.checkNotNull(orderId, ErrorCode.ORDER_ID_NULL);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.ORDER_NOT_FOUND, "id=" + orderId));
        orderRepository.delete(order);
    }
}