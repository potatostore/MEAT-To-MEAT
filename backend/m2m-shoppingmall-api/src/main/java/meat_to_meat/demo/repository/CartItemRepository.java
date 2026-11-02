package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // (cart_id, product_id)는 UNIQUE이므로 레코드 1줄 -> Optional 반환
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    // 한 장바구니에 담긴 여러 상품 목록 조회 -> List 반환
    List<CartItem> findAllByCart(Cart cart);
}