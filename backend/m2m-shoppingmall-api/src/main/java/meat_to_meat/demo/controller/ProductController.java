package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.product.CategoryResponseDTO;
import meat_to_meat.demo.dto.product.PageResponseDTO;
import meat_to_meat.demo.dto.product.ProductRequestDTO;
import meat_to_meat.demo.dto.product.ProductResponseDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping(UrlNames.categoryBase)
    public ResponseEntity<List<CategoryResponseDTO>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

    @GetMapping(UrlNames.productBase)
    public ResponseEntity<PageResponseDTO<ProductResponseDTO>> searchProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.searchProducts(category, q, sort, page, size));
    }

    @GetMapping(UrlNames.productBase + UrlNames.productId)
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProduct(productId));
    }

    // 아래 세 개는 관리자 기능(PROD-01/04/05). 프론트 화면은 없고 로그인만 요구한다.
    @PostMapping(UrlNames.productBase)
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PatchMapping(UrlNames.productBase + UrlNames.productId)
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long productId,
                                                            @Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    @DeleteMapping(UrlNames.productBase + UrlNames.productId)
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}
