package meat_to_meat.demo.service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.OrderUpdateDTO;
import meat_to_meat.demo.entity.Order.Order;
import meat_to_meat.demo.entity.Order.OrderStatus;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.OrderRepository;
import meat_to_meat.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;


@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    private final CartRepository cartRepository;

    @Transactional
    public OrderResponseDTO createOrder(Long userId)
    {
        //1. 유저 아이디가 널인지, 로그인이 돼 있는지(회원만 구매 가능)
        //2. 상품 개수가 0이하인지
        //3. 아니라면 상품 개수 하나 줄이기.
        //4. 주문 상태 변경.
        if (userId == null){
            throw new IllegalArgumentException("유저 아이디는 null일 수 없습니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 유저입니다."));
//
//        Cart cart = cartRepository.findByUser(user);
//        long totalPrice = 0L;
//
//        for(CartItem item : cart.getCartItems()){
//            Product product = item.getProduct();
//
//            if(product.getStockQuantity() < item.getQuantity()){
//                throw new IllegalStateException("재고가 부족합니다: " + product.getProductName());
//            }
//        }
//
//        product.removeStock(item.getQuantity());
//
//        totalPrice += (product.getPrice() * item.getQuantity());

        long tempTotalPrice = 0L;

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.ORDER_RECEIVED)
                .totalOrderPrice(tempTotalPrice)
                .build();

        Order saveOrder = orderRepository.save(order);

        return new OrderResponseDTO(saveOrder);

    }

    public OrderResponseDTO getOrder(Long orderId) {

    }

    public OrderResponseDTO getOrders(){

    }

    public OrderResponseDTO updateOrder(Long orderId, OrderUpdateDTO orderUpdateDTO){

    }

}
