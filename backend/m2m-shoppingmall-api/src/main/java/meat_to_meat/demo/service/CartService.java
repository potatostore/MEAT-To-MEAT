package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.AddCartItemRequestDTO;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.dto.cart.CartUpdateDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.global.npecheck.ErrorCode;
import meat_to_meat.demo.global.npecheck.NpeCheck;
import meat_to_meat.demo.repository.CartItemRepository;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.ProductRepository;
import meat_to_meat.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public CartResponseDTO createCart(Long userId) {
        // 1. userId npe check
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        // 2. user 조회 및 중복 장바구니 검증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.USER_NOT_FOUND.getMessage() + " id=" + userId));

        if (cartRepository.existsByUser(user)) {
            throw new IllegalStateException(ErrorCode.CART_ALREADY_EXISTS.getMessage());
        }

        Cart cart = Cart.builder()
                .user(user)
                .build();

        Cart savedCart = cartRepository.save(cart);
        return new CartResponseDTO(savedCart);
    }

    @Transactional
    public CartResponseDTO addCartItem(Long userId, AddCartItemRequestDTO request) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);
        NpeCheck.checkNotNull(request, ErrorCode.CART_DTO_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.USER_NOT_FOUND.getMessage()));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException(ErrorCode.CART_NOT_FOUND.getMessage()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.PRODUCT_NOT_FOUND.getMessage()));

        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingItem.isPresent()) {
            existingItem.get().addQuantity(request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return new CartResponseDTO(cart);
    }

    @Transactional(readOnly = true)
    public List<CartResponseDTO> getAllCarts() {
        return cartRepository.findAll().stream()
                .map(CartResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CartResponseDTO getCartByUserId(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.USER_NOT_FOUND.getMessage()));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException(ErrorCode.CART_NOT_FOUND.getMessage()));

        return new CartResponseDTO(cart);
    }

    @Transactional
    public CartResponseDTO updateCart(Long cartId, CartUpdateDTO cartUpdateDTO) {
        NpeCheck.checkNotNull(cartId, ErrorCode.CART_ID_NULL);
        NpeCheck.checkNotNull(cartUpdateDTO, ErrorCode.CART_DTO_NULL);

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.CART_NOT_FOUND.getMessage()));

        return new CartResponseDTO(cart);
    }

    @Transactional
    public void deleteCart(Long cartId) {
        NpeCheck.checkNotNull(cartId, ErrorCode.CART_ID_NULL);

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.CART_NOT_FOUND.getMessage()));
        cartRepository.delete(cart);
    }

    @Transactional
    public void deleteCartItem(Long userId, Long productId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);
        NpeCheck.checkNotNull(productId, ErrorCode.PRODUCT_ID_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.USER_NOT_FOUND.getMessage()));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException(ErrorCode.CART_NOT_FOUND.getMessage()));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.PRODUCT_NOT_FOUND.getMessage()));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.CART_ITEM_NOT_FOUND.getMessage()));

        cartItemRepository.delete(cartItem);
    }
}