package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByProductName(String productName);
    List<Product> findDistinctByProductCategoryIn(List<String> categories);
}