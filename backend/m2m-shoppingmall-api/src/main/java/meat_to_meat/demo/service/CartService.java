package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.AddCartItemRequestDTO;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.GlobalMeatToMeatException;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    // CART-03 장바구니 불러오기
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(Long userId) {
        return CartResponseDTO.from(findCart(userId));
    }

    // CART-02 장바구니 상품 담기: 같은 상품이면 수량만 늘린다 (UNIQUE(cart_id, product_id))
    @Transactional
    public CartResponseDTO addCartItem(Long userId, AddCartItemRequestDTO request) {
        Cart cart = findCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "productId=" + request.getProductId()));

        Optional<CartItem> existing = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(product.getProductId()))
                .findFirst();

        int totalQuantity = existing.map(CartItem::getQuantity).orElse(0) + request.getQuantity();
        checkStock(product, totalQuantity);

        if (existing.isPresent()) {
            existing.get().addQuantity(request.getQuantity());
        } else {
            cart.getCartItems().add(CartItem.builder().cart(cart).product(product).quantity(request.getQuantity()).build());
        }
        cartRepository.flush(); // 새 cart_item 의 id 를 응답에 담기 위해 즉시 반영
        return CartResponseDTO.from(cart);
    }

    // CART-04 장바구니 수정 (수량 변경)
    @Transactional
    public CartResponseDTO updateCartItem(Long userId, Long cartItemId, int quantity) {
        Cart cart = findCart(userId);
        CartItem item = findItem(cart, cartItemId);
        checkStock(item.getProduct(), quantity);
        item.updateQuantity(quantity);
        return CartResponseDTO.from(cart);
    }

    // CART-06 장바구니 상품 삭제
    @Transactional
    public CartResponseDTO removeCartItem(Long userId, Long cartItemId) {
        Cart cart = findCart(userId);
        cart.getCartItems().remove(findItem(cart, cartItemId));
        return CartResponseDTO.from(cart);
    }

    // 장바구니 비우기 (장바구니 자체는 회원과 1:1 로 유지)
    @Transactional
    public void clearCart(Long userId) {
        findCart(userId).getCartItems().clear();
    }

    private Cart findCart(Long userId) {
        return cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "userId=" + userId));
    }

    private CartItem findItem(Cart cart, Long cartItemId) {
        return cart.getCartItems().stream()
                .filter(item -> item.getCartItemId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_ITEM_NOT_FOUND, "cartItemId=" + cartItemId));
    }

    private void checkStock(Product product, int quantity) {
        if (product.getStockQuantity() < quantity) {
            throw new GlobalMeatToMeatException(ErrorCode.OUT_OF_STOCK, "요청 수량=" + quantity);
        }
    }
}
