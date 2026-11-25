package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.cart.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // [튜닝 2] 상품 삭제 시 그 상품이 담긴 장바구니 항목만 한 번의 DELETE 로 지운다
    //   (이전: 모든 장바구니를 불러와 메모리에서 지움 → 장바구니 수만큼 SQL 발생)
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM CartItem ci WHERE ci.product.productId = :productId")
    int deleteAllByProductId(@Param("productId") Long productId);
}
