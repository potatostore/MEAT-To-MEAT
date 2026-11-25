package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.product.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByProductName(String productName);

    // PROD-02 전체 조회 / PROD-06 카테고리별 조회 / 상품명 검색을 하나의 페이지 쿼리로 처리
    @Query("SELECT p FROM Product p " +
            "WHERE (:category IS NULL OR p.productCategory = :category) " +
            "AND (:keyword IS NULL OR p.productName LIKE CONCAT('%', :keyword, '%'))")
    Page<Product> search(@Param("category") ProductCategory category,
                         @Param("keyword") String keyword,
                         Pageable pageable);
}
