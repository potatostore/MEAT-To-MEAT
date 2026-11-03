package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.product.ProductCreateDTO;
import meat_to_meat.demo.dto.product.ProductResponseDTO;
import meat_to_meat.demo.dto.product.ProductUpdateDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(UrlNames.productBase)
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping(value = UrlNames.createProduct)
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductCreateDTO createDTO) {
        return ResponseEntity.ok(productService.createProduct(createDTO));
    }

    @GetMapping(value = UrlNames.getAllProducts)
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping(value = UrlNames.getProduct)
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProduct(productId));
    }

    @GetMapping(value = UrlNames.getProductsByCategory)
    public ResponseEntity<List<ProductResponseDTO>> getAllProductsByCategory(
            @RequestParam List<String> categories) {
        return ResponseEntity.ok(productService.getProductByCategory(categories));
    }

    @PatchMapping(value = UrlNames.updateProduct)
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductUpdateDTO updateDTO) {
        return ResponseEntity.ok(productService.updateProduct(productId, updateDTO));
    }

    @DeleteMapping(value = UrlNames.deleteProduct)
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}