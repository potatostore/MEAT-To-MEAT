package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.AddCartItemRequestDTO;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.dto.cart.CartUpdateDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.global.exception.DuplicateException;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.GlobalMeatToMeatException;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.global.exception.NpeCheck;
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

    @Transactional
    public CartResponseDTO createCart(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND, "id=" + userId));

        if (cartRepository.existsByUser(user)) {
            throw new DuplicateException(ErrorCode.CART_ALREADY_EXISTS);
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

        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "userId=" + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "productId=" + request.getProductId()));

        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(product.getProductId()))
                .findFirst();

        long totalRequestedQuantity = existingItem
                .map(item -> item.getQuantity() + request.getQuantity())
                .orElse(request.getQuantity());

        // CUD 예외 처리: 상품 재고 부족 검증
        if (product.getProductQuantity() < totalRequestedQuantity) {
            throw new GlobalMeatToMeatException(ErrorCode.OUT_OF_STOCK, "요청 수량=" + totalRequestedQuantity);
        }

        if (existingItem.isPresent()) {
            existingItem.get().addQuantity(request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getCartItems().add(newItem);
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

        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "userId=" + userId));

        return new CartResponseDTO(cart);
    }

    @Transactional
    public CartResponseDTO updateCart(Long cartId, CartUpdateDTO cartUpdateDTO) {
        NpeCheck.checkNotNull(cartId, ErrorCode.CART_ID_NULL);
        NpeCheck.checkNotNull(cartUpdateDTO, ErrorCode.CART_DTO_NULL);

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "cartId=" + cartId));

        CartItem targetItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(cartUpdateDTO.getProductId()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_ITEM_NOT_FOUND, "productId=" + cartUpdateDTO.getProductId()));

        // CUD 예외 처리: 변경하려는 수량이 상품 재고를 초과하는지 검증
        if (targetItem.getProduct().getProductQuantity() < cartUpdateDTO.getQuantity()) {
            throw new GlobalMeatToMeatException(ErrorCode.OUT_OF_STOCK, "요청 수량=" + cartUpdateDTO.getQuantity());
        }

        targetItem.updateQuantity(cartUpdateDTO.getQuantity());

        return new CartResponseDTO(cart);
    }

    @Transactional
    public void deleteCart(Long cartId) {
        NpeCheck.checkNotNull(cartId, ErrorCode.CART_ID_NULL);

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "cartId=" + cartId));
        cartRepository.delete(cart);
    }

    @Transactional
    public void deleteCartItem(Long userId, Long productId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);
        NpeCheck.checkNotNull(productId, ErrorCode.PRODUCT_ID_NULL);

        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "userId=" + userId));

        boolean removed = cart.getCartItems().removeIf(
                item -> item.getProduct().getProductId().equals(productId)
        );

        if (!removed) {
            throw new NotFoundException(ErrorCode.CART_ITEM_NOT_FOUND, "productId=" + productId);
        }
    }
}