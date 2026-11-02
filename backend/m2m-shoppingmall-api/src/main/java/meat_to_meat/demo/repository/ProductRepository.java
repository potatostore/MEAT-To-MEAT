package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 상품명은 UNIQUE 제약조건이 있으므로 단건 조회 시 Optional 사용
    Optional<Product> findByProductName(String productName);
    boolean existsByProductName(String productName);

    // 카테고리 포함 상품 다건 조회 (여러 줄 반환 -> List 사용)
    List<Product> findDistinctByProductCategoryIn(List<String> categories);
}