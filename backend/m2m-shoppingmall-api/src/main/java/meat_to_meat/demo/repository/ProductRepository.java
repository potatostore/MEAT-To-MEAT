package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.product.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByProductName(String productName);

    // PROD-02 전체 조회 / PROD-06 카테고리별 조회 / 상품명 검색을 하나의 페이지 쿼리로 처리
    @Query("SELECT p FROM Product p " +
            "WHERE (:category IS NULL OR p.productCategory = :category) " +
            "AND (:keyword IS NULL OR p.productName LIKE CONCAT('%', :keyword, '%'))")
    Page<Product> search(@Param("category") ProductCategory category,
                         @Param("keyword") String keyword,
                         Pageable pageable);

    // [튜닝 4] 재고를 바꾸기 전에 상품 행에 배타 락(SELECT ... FOR UPDATE)을 건다
    //   - 다른 주문은 이 트랜잭션이 끝날 때까지 기다린 뒤 최신 재고를 읽는다 → Lost Update 방지
    //   - 항상 product_id 오름차순으로 락을 잡아 서로 반대 순서로 기다리는 데드락을 막는다
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.productId IN :ids ORDER BY p.productId")
    List<Product> findAllByIdForUpdate(@Param("ids") Collection<Long> ids);
}
