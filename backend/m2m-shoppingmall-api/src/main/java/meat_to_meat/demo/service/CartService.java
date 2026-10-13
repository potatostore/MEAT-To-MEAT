package meat_to_meat.demo.service;


import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.AddCartItemRequestDTO;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.dto.cart.cartItem.CartItemResponseDTO;
import meat_to_meat.demo.dto.user.UserResponseDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.repository.CartItemRepository;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.ProductRepository;
import meat_to_meat.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public CartResponseDTO createCart(Long userId){
        // 1. userId npe check
       if (userId == null){
           throw new IllegalArgumentException("유저 ID는 null일 수 없습니다.");
       }


        // 2. userId에 매핑되는 cart생성 : 이때 생성자는 builder로 최대한 통일
       User user = userRepository.findById(userId).orElseThrow((() -> new IllegalArgumentException("존재하지 않는 유저입니다." + userId)));


        if(cartRepository.existsByUser(user))
        {
            throw new IllegalStateException("해당 유저는 이미 장바구니를 가지고 있습니다.");
        }

        Cart cart = Cart.builder()
                .user(user)
                .build();

        // 3. repository에 저장
        Cart savedCart = cartRepository.save(cart);

        // 4. entity를 dto로 매핑 (힌트 : dto 내부에 Entity 객체를 받는 생성자를 통해 변환)
        return new CartResponseDTO(savedCart);

        // 5. dto 반환
        //throw new UnsupportedOperationException("TODO: createCart 미구현");
    }

    @Transactional
    public CartResponseDTO addCartItem(Long userId, AddCartItemRequestDTO request){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("장바구니가 존재하지 않습니다."));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다."));

        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProduct(cart, product);

        if(existingItem.isPresent()){
            existingItem.get().addQuantity(request.getQuantity());
        } else{
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return new CartResponseDTO(cart);

    }



}
